<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeliveryAddress;
use App\Support\StudentAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentAddressController extends Controller
{
    public function index(Request $request)
    {
        StudentAccess::require($request);
        return DeliveryAddress::where('user_id', $request->user()->id)->orderByDesc('id')->get();
    }

    public function store(Request $request)
    {
        StudentAccess::require($request);
        $data = $request->validate($this->rules());
        return response()->json(DeliveryAddress::create(['user_id' => $request->user()->id, ...$data]), 201);
    }

    public function update(Request $request, DeliveryAddress $address)
    {
        StudentAccess::require($request);
        abort_unless($address->user_id === $request->user()->id, 404);
        $data = $request->validate([...$this->rules('sometimes'), 'expected_version' => ['required', 'integer', 'min:1']]);
        $expected = $data['expected_version']; unset($data['expected_version']);
        DB::transaction(function () use ($address, $data, $expected) {
            $locked = DeliveryAddress::whereKey($address->id)->lockForUpdate()->firstOrFail();
            abort_if($locked->version !== $expected, 409);
            $locked->update([...$data, 'version' => $locked->version + 1]);
        });
        return $address->refresh();
    }

    public function destroy(Request $request, DeliveryAddress $address)
    {
        StudentAccess::require($request);
        abort_unless($address->user_id === $request->user()->id, 404);
        $data = $request->validate(['expected_version' => ['required', 'integer', 'min:1']]);
        DB::transaction(function () use ($address, $data) {
            $locked = DeliveryAddress::whereKey($address->id)->lockForUpdate()->firstOrFail();
            abort_if($locked->version !== $data['expected_version'], 409);
            $locked->delete();
        });
        return response()->noContent();
    }

    private function rules(string $presence = 'required'): array
    {
        return [
            'label' => [$presence, 'string', 'max:80'],
            'address_line' => [$presence, 'string', 'max:255'],
            'district' => [$presence, 'string', 'max:120'],
            'city' => ['sometimes', 'string', 'in:Kinshasa'],
            'phone' => [$presence, 'string', 'max:30'],
        ];
    }
}
