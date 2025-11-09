const UserAvatar = ({ user, size = 'md', className = '' }) => {
  const sizeClasses = {
    xs: 'h-8 w-8 text-sm',
    sm: 'h-10 w-10 text-base',
    md: 'h-12 w-12 text-xl',
    lg: 'h-24 w-24 text-4xl',
    xl: 'h-32 w-32 text-5xl',
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  // Get initials from first and last name
  const getInitials = () => {
    const firstInitial = user?.first_name?.charAt(0).toUpperCase() || '';
    const lastInitial = user?.last_name?.charAt(0).toUpperCase() || '';
    return firstInitial + lastInitial || '?';
  };

  // Always show initials (removed profile picture display)
  return (
    <div
      className={`rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${sizeClass} ${className}`}
    >
      <span className="text-white font-bold">
        {getInitials()}
      </span>
    </div>
  );
};

export default UserAvatar;
