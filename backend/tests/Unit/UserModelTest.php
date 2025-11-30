<?php

namespace Tests\Unit;

use App\Models\User;
use Tests\TestCase;

class UserModelTest extends TestCase
{
    public function test_primary_key_is_string_and_not_incrementing(): void
    {
        $user = new User();

        $this->assertSame('user_pk', $user->getKeyName());
        $this->assertFalse($user->getIncrementing());
        $this->assertSame('string', $user->getKeyType());
    }

    public function test_password_is_hidden_in_arrays(): void
    {
        $user = new User(['user_password' => 'secret']);

        $array = $user->toArray();

        $this->assertArrayNotHasKey('user_password', $array);
    }
}
