<?php

namespace Database\Seeders;

use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AppDemoSeeder extends Seeder
{
    public function run(): void
    {
        if (!app()->environment(['local', 'testing'])) throw new \RuntimeException('Démonstration locale uniquement.');
        $this->call([DatabaseSeeder::class, TestAccountsSeeder::class, PlatformRecetteSeeder::class]);
        DB::transaction(function () {
            $student = User::where('email', 'etudiant@monmiammiam.test')->firstOrFail();
            foreach (['khalifa-food' => [75,101,129,157,176,202,228,253,279], 'sleepy-hollow' => [129,176,253,279]] as $id => $layers) {
                $restaurant = Restaurant::findOrFail($id);
                foreach ($restaurant->contents()->where('kind', 'dish')->orderBy('id')->get() as $i => $dish) {
                    $dish->update(['image_url' => '/figma-public/19-Menu--Public/assets/layer-'.str_pad($layers[$i % count($layers)], 5, '0', STR_PAD_LEFT).'.svg']);
                }
                foreach (range(0, 6) as $day) foreach (['pickup','delivery','dine_in'] as $service) {
                    $restaurant->serviceSlots()->firstOrCreate(['service' => $service, 'weekday' => $day, 'starts_at' => '08:00:00'], ['ends_at' => '23:00:00', 'is_active' => true]);
                }
                $restaurant->diningTables()->firstOrCreate(['code' => 'T-01'], ['capacity' => 4, 'is_active' => true]);
                $restaurant->deliveryZones()->firstOrCreate(['district' => 'Gombe'], ['fee_cdf' => 1000, 'is_active' => true]);
                $dish = $restaurant->contents()->where('kind', 'dish')->firstOrFail();
                foreach (['received','preparing','served'] as $i => $status) {
                    $orderId = 'TEST-APP-'.$id.'-'.$i;
                    if (DB::table('orders')->where('id', $orderId)->exists()) continue;
                    DB::table('orders')->insert(['id' => $orderId, 'restaurant_id' => $id, 'user_id' => $student->id, 'customer_name' => $student->name, 'service' => 'pickup', 'status' => $status, 'amount_cdf' => $dish->price_cdf, 'subtotal_cdf' => $dish->price_cdf, 'is_demo' => true, 'created_at' => now()->subMinutes(30 * ($i + 1)), 'updated_at' => now()]);
                    DB::table('order_lines')->insert(['order_id' => $orderId, 'content_id' => $dish->id, 'title_snapshot' => $dish->title, 'quantity' => 1, 'unit_price_cdf' => $dish->price_cdf, 'line_total_cdf' => $dish->price_cdf, 'created_at' => now(), 'updated_at' => now()]);
                    DB::table('order_events')->insert(['order_id' => $orderId, 'actor_id' => $student->id, 'to_status' => $status, 'action' => 'created', 'order_version' => 1, 'created_at' => now()]);
                }
                $claimId = 'TEST-APP-CLAIM-'.$id;
                if (!DB::table('complaints')->where('id', $claimId)->exists()) {
                    DB::table('complaints')->insert(['id' => $claimId, 'restaurant_id' => $id, 'user_id' => $student->id, 'order_id' => 'TEST-APP-'.$id.'-2', 'student_name' => $student->name, 'reason' => 'Test : un accompagnement manquait dans ma commande.', 'status' => 'open', 'is_demo' => true, 'created_at' => now(), 'updated_at' => now()]);
                    DB::table('complaint_messages')->insert(['complaint_id' => $claimId, 'author_id' => $student->id, 'kind' => 'message', 'visibility' => 'public', 'body' => 'Dossier fictif pour tester le traitement des réclamations.', 'created_at' => now()]);
                }
            }
            foreach (User::whereIn('email', ['etudiant@monmiammiam.test','employe@monmiammiam.test','gerant@monmiammiam.test','admin@monmiammiam.test','plateforme@monmiammiam.test'])->get() as $user) {
                DB::table('app_notifications')->updateOrInsert(['user_id' => $user->id, 'event_key' => 'TEST-APP-WELCOME'], ['restaurant_id' => 'khalifa-food', 'audience' => $user->is_platform_admin ? 'platform' : ($user->id === $student->id ? 'student' : 'staff'), 'type' => 'demo', 'data' => json_encode(['title' => 'Bienvenue dans la démonstration', 'message' => 'Des commandes et réclamations fictives sont disponibles.']), 'created_at' => now(), 'updated_at' => now()]);
            }
        });
    }
}
