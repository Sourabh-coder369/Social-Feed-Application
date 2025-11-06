const UserAvatar = ({ user, size = 'md', className = '' }) => {
  const sizeClasses = {
    xs: 'h-8 w-8 text-sm',
    sm: 'h-10 w-10 text-base',
    md: 'h-12 w-12 text-xl',
    lg: 'h-24 w-24 text-4xl',
    xl: 'h-32 w-32 text-5xl',
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  if (user?.profile_pic_URL) {
    return (
      <img
        src={user.profile_pic_URL}
        alt={`${user?.first_name} ${user?.last_name}`}
        className={`rounded-full object-cover ${sizeClass} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center ${sizeClass} ${className}`}
    >
      <span className="text-white font-bold">
        {user?.first_name?.charAt(0).toUpperCase() || '?'}
      </span>
    </div>
  );
};

export default UserAvatar;
