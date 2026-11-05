<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\ComplaintAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class ComplaintAttachmentController extends Controller
{
    public function store(Request $request, Complaint $complaint)
    {
        abort_if($request->user()->is_platform_admin, 403);
        abort_unless(Gate::allows('upload', $complaint), 404);
        $data = $request->validate(['file' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120']]);
        $file = $data['file'];
        $path = $file->store("complaints/{$complaint->id}", 'local');
        $attachment = $complaint->attachments()->create([
            'uploaded_by' => $request->user()->id, 'path' => $path,
            'original_name' => Str::limit($file->getClientOriginalName(), 255, ''),
            'mime_type' => $file->getMimeType(), 'size_bytes' => $file->getSize(),
            'visibility' => $complaint->user_id === $request->user()->id ? 'student' : 'internal',
            'created_at' => now(),
        ]);
        return response()->json($attachment, 201);
    }

    public function temporaryUrl(Request $request, Complaint $complaint, ComplaintAttachment $attachment)
    {
        abort_if($request->user()->is_platform_admin, 403);
        abort_unless($attachment->complaint_id === $complaint->id && Gate::allows('viewAttachment', [$complaint, $attachment->visibility]), 404);
        $expires = now()->addMinutes(5);
        return response()->json([
            'url' => URL::temporarySignedRoute('complaint.attachment.download', $expires, ['attachment' => $attachment->id, 'viewer' => $request->user()->id]),
            'expires_at' => $expires->toIso8601String(),
        ]);
    }

    public function download(Request $request, ComplaintAttachment $attachment)
    {
        abort_unless((string) $request->query('viewer') === (string) $request->user()->id, 403);
        abort_if($request->user()->is_platform_admin, 403);
        abort_unless(Gate::allows('viewAttachment', [$attachment->complaint, $attachment->visibility]), 404);
        abort_unless(Storage::disk('local')->exists($attachment->path), 404);
        return Storage::disk('local')->download($attachment->path, $attachment->original_name);
    }
}
