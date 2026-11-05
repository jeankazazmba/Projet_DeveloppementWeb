<?php

namespace App\Support;

use App\Models\DeliveryAddress;
use App\Models\DeliveryZone;
use App\Models\DiningTable;
use App\Models\TableReservation;
use App\Models\MenuOption;
use App\Models\Restaurant;
use App\Models\RestaurantContent;
use App\Models\ServiceSlot;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderPricing
{
    public static function calculate(Restaurant $restaurant, int $userId, array $data, array $items, bool $reserve = false): array
    {
        if ($restaurant->status !== 'active' || !$restaurant->is_public) self::invalid('restaurant', 'Restaurant indisponible.');
        if (!$items || count($items) > 30) self::invalid('items', 'Le panier doit contenir de 1 à 30 lignes.');

        $requested = Carbon::parse($data['requested_at'])->setTimezone('Africa/Kinshasa');
        if ($requested->lessThanOrEqualTo(now()->addMinutes(15)) || $requested->greaterThan(now()->addDays(14))) {
            self::invalid('requested_at', 'Choisissez une heure entre 15 minutes et 14 jours à partir de maintenant.');
        }
        $slot = ServiceSlot::whereKey($data['service_slot_id'])->where('restaurant_id', $restaurant->id)
            ->where('service', $data['service'])->where('weekday', $requested->dayOfWeek)->where('is_active', true)->first();
        if (!$slot || $requested->format('H:i:s') < $slot->starts_at || $requested->format('H:i:s') >= $slot->ends_at) {
            self::invalid('service_slot_id', 'Ce créneau ne couvre pas l’heure demandée.');
        }
        $address = null; $zone = null; $table = null;
        if ($data['service'] === 'delivery') {
            $address = DeliveryAddress::whereKey($data['delivery_address_id'] ?? null)->where('user_id', $userId)->first();
            if (!$address || mb_strtolower($address->city) !== 'kinshasa') self::invalid('delivery_address_id', 'Adresse de livraison invalide à Kinshasa.');
            if (DeliveryZone::where('restaurant_id', $restaurant->id)->exists()) {
                $zone = DeliveryZone::where('restaurant_id', $restaurant->id)->whereRaw('LOWER(district) = ?', [mb_strtolower($address->district)])->where('is_active', true)->first();
                if (!$zone) self::invalid('delivery_address_id', 'Adresse hors zone de livraison active.');
            }
        } elseif (isset($data['delivery_address_id'])) {
            self::invalid('delivery_address_id', 'Adresse réservée aux livraisons.');
        }
        if ($data['service'] === 'dine_in') {
            if (empty($data['dining_table_id']) || empty($data['party_size'])) self::invalid('dining_table_id', 'Table et nombre de convives obligatoires.');
            if ($requested->copy()->addMinutes(90)->format('H:i') > substr($slot->ends_at, 0, 5) || $requested->copy()->addMinutes(90)->dayOfWeek !== $requested->dayOfWeek) {
                self::invalid('requested_at', 'Le service sur place doit se terminer pendant le créneau ouvert.');
            }
            $tableQuery = DiningTable::whereKey($data['dining_table_id'])->where('restaurant_id', $restaurant->id)->where('is_active', true);
            if ($reserve) $tableQuery->lockForUpdate();
            $table = $tableQuery->first();
            if (!$table || $data['party_size'] > $table->capacity) self::invalid('dining_table_id', 'Table indisponible ou capacité insuffisante.');
            $starts = $requested->copy()->utc(); $ends = $starts->copy()->addMinutes(90);
            if (TableReservation::where('dining_table_id', $table->id)->where('status', 'active')
                ->where('starts_at', '<', $ends)->where('ends_at', '>', $starts)->exists()) {
                self::invalid('dining_table_id', 'Table déjà réservée pour cette heure.');
            }
        } elseif (isset($data['dining_table_id']) || isset($data['party_size'])) {
            self::invalid('dining_table_id', 'Table réservée au service sur place.');
        }

        $contentIds = collect($items)->pluck('content_id')->unique()->sort()->values()->all();
        $dishes = RestaurantContent::where('restaurant_id', $restaurant->id)->where('kind', 'dish')
            ->whereIn('id', $contentIds)->orderBy('id');
        if ($reserve) $dishes->lockForUpdate();
        $dishes = $dishes->get()->keyBy('id');
        $optionIds = collect($items)->flatMap(fn ($item) => array_merge(
            isset($item['variant_id']) ? [$item['variant_id']] : [], $item['supplement_ids'] ?? []
        ))->unique()->sort()->values()->all();
        $options = MenuOption::whereIn('id', $optionIds)->orderBy('id');
        if ($reserve) $options->lockForUpdate();
        $options = $options->get()->keyBy('id');
        $variantCounts = MenuOption::whereIn('content_id', $contentIds)->where('kind', 'variant')->selectRaw('content_id, count(*) as total')->groupBy('content_id')->pluck('total', 'content_id');
        $dishQuantities = []; $optionQuantities = []; $lines = []; $subtotal = 0;
        foreach ($items as $item) {
            $dish = $dishes->get($item['content_id']);
            if (!$dish || !$dish->is_published || !$dish->is_available || $dish->price_cdf === null
                || ($dish->published_from && $dish->published_from->isFuture())
                || ($dish->published_until && !$dish->published_until->isFuture())
                || ($dish->category_id && !DB::table('menu_categories')->where('id', $dish->category_id)->where('restaurant_id', $restaurant->id)->where('is_active', true)->exists())) {
                self::invalid('items', 'Un plat est indisponible ou non publié.');
            }
            $quantity = (int) $item['quantity'];
            $dishQuantities[$dish->id] = ($dishQuantities[$dish->id] ?? 0) + $quantity;
            $variantId = $item['variant_id'] ?? null;
            if (($variantCounts[$dish->id] ?? 0) > 0 && !$variantId) self::invalid('items', 'Choisissez une variante.');
            $selected = []; $unit = $dish->price_cdf;
            if ($variantId) {
                $variant = $options->get($variantId);
                if (!$variant || $variant->content_id !== $dish->id || $variant->kind !== 'variant' || !$variant->is_available) self::invalid('items', 'Variante invalide.');
                $selected[] = ['id' => $variant->id, 'kind' => 'variant', 'name' => $variant->name, 'price_delta_cdf' => $variant->price_delta_cdf, 'stock_reserved' => $variant->stock_quantity !== null];
                $unit += $variant->price_delta_cdf;
                $optionQuantities[$variant->id] = ($optionQuantities[$variant->id] ?? 0) + $quantity;
            }
            $supplements = $item['supplement_ids'] ?? [];
            if (count($supplements) !== count(array_unique($supplements))) self::invalid('items', 'Supplément répété.');
            foreach ($supplements as $id) {
                $option = $options->get($id);
                if (!$option || $option->content_id !== $dish->id || $option->kind !== 'supplement' || !$option->is_available) self::invalid('items', 'Supplément invalide.');
                $selected[] = ['id' => $option->id, 'kind' => 'supplement', 'name' => $option->name, 'price_delta_cdf' => $option->price_delta_cdf, 'stock_reserved' => $option->stock_quantity !== null];
                $unit += $option->price_delta_cdf;
                $optionQuantities[$option->id] = ($optionQuantities[$option->id] ?? 0) + $quantity;
            }
            $total = $unit * $quantity;
            $subtotal += $total;
            $lines[] = ['content_id' => $dish->id, 'title_snapshot' => $dish->title, 'options_snapshot' => $selected,
                'stock_reserved' => $dish->stock_quantity !== null,
                'quantity' => $quantity, 'unit_price_cdf' => $unit, 'line_total_cdf' => $total];
        }
        foreach ($dishQuantities as $id => $quantity) {
            if ($dishes[$id]->stock_quantity !== null && $dishes[$id]->stock_quantity < $quantity) self::invalid('items', 'Stock insuffisant pour un plat.');
        }
        foreach ($optionQuantities as $id => $quantity) {
            if ($options[$id]->stock_quantity !== null && $options[$id]->stock_quantity < $quantity) self::invalid('items', 'Stock insuffisant pour une option.');
        }
        $fee = $data['service'] === 'delivery' ? ($zone?->fee_cdf ?? $restaurant->delivery_fee_cdf) : 0;
        if ($subtotal + $fee > 4000000000) self::invalid('items', 'Montant trop élevé.');
        if ($reserve) {
            foreach ($dishQuantities as $id => $quantity) {
                if ($dishes[$id]->stock_quantity !== null) $dishes[$id]->update(['stock_quantity' => $dishes[$id]->stock_quantity - $quantity, 'version' => $dishes[$id]->version + 1]);
            }
            foreach ($optionQuantities as $id => $quantity) {
                if ($options[$id]->stock_quantity !== null) $options[$id]->update(['stock_quantity' => $options[$id]->stock_quantity - $quantity, 'version' => $options[$id]->version + 1]);
            }
        }
        return [
            'restaurant_id' => $restaurant->id, 'currency' => 'CDF', 'service' => $data['service'],
            'service_slot_id' => $slot->id, 'requested_at' => $requested->toIso8601String(),
            'delivery_address_id' => $address?->id,
            'delivery_address_snapshot' => $address ? $address->only(['label', 'address_line', 'district', 'city', 'phone']) : null,
            'delivery_zone_id' => $zone?->id,
            'delivery_zone_snapshot' => $zone ? ['district' => $zone->district, 'fee_cdf' => $zone->fee_cdf] : null,
            'dining_table_id' => $table?->id, 'party_size' => $table ? $data['party_size'] : null,
            'lines' => $lines,
            'subtotal_cdf' => $subtotal, 'delivery_fee_cdf' => $fee, 'total_cdf' => $subtotal + $fee,
        ];
    }

    private static function invalid(string $field, string $message): never
    {
        throw ValidationException::withMessages([$field => $message]);
    }
}
