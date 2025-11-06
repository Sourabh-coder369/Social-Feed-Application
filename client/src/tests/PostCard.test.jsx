import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PostCard from '../components/PostCard';

describe('PostCard Component', () => {
  const mockPost = {
    post_id: 1,
    user_id: 1,
    first_name: 'John',
    last_name: 'Doe',
    profile_pic_URL: 'https://example.com/avatar.jpg',
    image_url: 'https://example.com/post.jpg',
    video_url: null,
    likes_count: 10,
    comments_count: 5,
    created_at: new Date().toISOString(),
  };

  it('renders post information', () => {
    render(<PostCard post={mockPost} />);

    expect(screen.getByText('John Doe')).toBeDefined();
    expect(screen.getByText('10')).toBeDefined(); // likes count
    expect(screen.getByText('5')).toBeDefined(); // comments count
  });

  it('displays post image', () => {
    render(<PostCard post={mockPost} />);

    const image = screen.getByAltText('Post');
    expect(image).toBeDefined();
    expect(image.src).toBe(mockPost.image_url);
  });
});
