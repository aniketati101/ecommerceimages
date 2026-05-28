<?php

namespace App\Policies;

use Illuminate\Auth\Access\Response;
use App\Models\UpscaleImage;
use App\Models\User;

class UpscaleImagePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, UpscaleImage $upscaleImage): bool
    {
        return $user->id === $upscaleImage->user_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, UpscaleImage $upscaleImage): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, UpscaleImage $upscaleImage): bool
    {
        return $user->id === $upscaleImage->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, UpscaleImage $upscaleImage): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, UpscaleImage $upscaleImage): bool
    {
        return false;
    }

}
