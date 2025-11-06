import { useState } from 'react';
import { postService, uploadService } from '../services';
import toast from 'react-hot-toast';

const CreatePost = ({ onPostCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [useFileUpload, setUseFileUpload] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      setImageFile(file);
      setImageUrl(''); // Clear URL input
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setImageUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('Please write something for your post');
      return;
    }

    setLoading(true);

    try {
      let finalImageUrl = imageUrl;
      
      // If user uploaded a file, upload it first
      if (imageFile) {
        setUploading(true);
        const uploadResponse = await uploadService.uploadImage(imageFile);
        finalImageUrl = uploadResponse.data.url;
        setUploading(false);
      }
      
      await postService.createPost({ content, imageUrl: finalImageUrl });
      toast.success('Post created successfully!');
      setContent('');
      setImageUrl('');
      setImageFile(null);
      setImagePreview('');
      setIsOpen(false);
      if (onPostCreated) onPostCreated();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create post');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="card">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <span className="text-gray-600">What's on your mind?</span>
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              What's on your mind?
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts..."
              rows="3"
              className="input"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Add Image
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setUseFileUpload(true)}
                  className={`text-xs px-2 py-1 rounded ${
                    useFileUpload
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  📁 Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setUseFileUpload(false)}
                  className={`text-xs px-2 py-1 rounded ${
                    !useFileUpload
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  🔗 Use URL
                </button>
              </div>
            </div>

            {useFileUpload ? (
              <div>
                <input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Max size: 5MB. Formats: JPEG, PNG, GIF, WebP
                </p>
                
                {imagePreview && (
                  <div className="mt-3 relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImageFile(null);
                  setImagePreview('');
                }}
                placeholder="https://example.com/image.jpg"
                className="input"
              />
            )}
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="btn btn-primary flex-1 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : loading ? 'Posting...' : 'Post'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setContent('');
                setImageUrl('');
                setImageFile(null);
                setImagePreview('');
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreatePost;
