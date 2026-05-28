<?php

namespace App\Policies;

use Illuminate\Auth\Access\Response;
use App\Models\ImageEdit;
use App\Models\User;

class ImageEditPolicy
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
    public function view(User $user, ImageEdit $imageEdit): bool
    {
        return $user->id === $imageEdit->user_id;
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
    public function update(User $user, ImageEdit $imageEdit): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ImageEdit $imageEdit): bool
    {
        return $user->id === $imageEdit->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ImageEdit $imageEdit): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ImageEdit $imageEdit): bool
    {
        return false;
    }
}