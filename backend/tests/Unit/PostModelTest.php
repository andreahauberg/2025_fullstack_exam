<?php

namespace Tests\Unit;

use App\Models\Post;
use Tests\TestCase;

class PostModelTest extends TestCase
{
    public function test_primary_key_is_string_and_not_incrementing(): void
    {
        $post = new Post();

        $this->assertSame('post_pk', $post->getKeyName());
        $this->assertFalse($post->getIncrementing());
        $this->assertSame('string', $post->getKeyType());
    }

    public function test_soft_deletes_enabled(): void
    {
        $post = new Post();
        $this->assertTrue(method_exists($post, 'runSoftDelete'), 'SoftDeletes trait not present on Post model');
    }
}
