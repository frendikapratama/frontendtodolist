import { X, Eye, EyeOff, Edit, Save, Loader2, Camera, Upload } from 'lucide-react';
import { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';

const ProfileDialog = ({ show, onClose }) => {
    const { user, updateProfile } = useContext(AuthContext);
    const fileInputRef = useRef(null);

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPhotoZoom, setShowPhotoZoom] = useState(false);
    const [username, setUsername] = useState('');
    const [noHp, setNoHp] = useState('');
    const [departemen, setDepartemen] = useState('');
    const [divisi, setDivisi] = useState('');
    const [posisi, setPosisi] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    useEffect(() => {
        if (user) {
            setUsername(user.username || '');
            setNoHp(user.noHp || '');
            setDepartemen(user.departemen || '');
            setDivisi(user.divisi || '');
            setPosisi(user.posisi || '');
            setNewPassword('');
            setSelectedPhoto(null);
            setPhotoPreview(null);
        }
    }, [user, show]);

    const handlePhotoClick = () => {
        if (isEditing) {
            fileInputRef.current?.click();
        } else {
            setShowPhotoZoom(true);
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size must be less than 5MB');
                return;
            }
            setSelectedPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('noHp', noHp);
            formData.append('departemen', departemen || '');
            formData.append('divisi', divisi || '');
            formData.append('posisi', posisi);
            if (newPassword.trim() !== '') {
                if (newPassword.length < 6) {
                    setError('Password must be at least 6 characters');
                    setLoading(false);
                    return;
                }
                formData.append('password', newPassword);
            }
            if (selectedPhoto) {
                formData.append('photo', selectedPhoto);
            }   
            const result = await updateProfile(formData);

            if (result.success) {
                setSuccess('Profile updated successfully!');
                setNewPassword('');
                setSelectedPhoto(null);
                setPhotoPreview(null);
                setIsEditing(false);

                setTimeout(() => {
                    setSuccess('');
                    onClose();
                }, 2000);
            } else {
                setError(result.message || 'Failed to update profile');
            }
        } catch (err) {
            console.error('Save error:', err);
            setError('An error occurred while updating profile');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (user) {
            setUsername(user.username || '');
            setNoHp(user.noHp || '');
            setDepartemen(user.departemen || '');
            setDivisi(user.divisi || '');
            setPosisi(user.posisi || '');
            setNewPassword('');
            setSelectedPhoto(null);
            setPhotoPreview(null);
        }
        setError('');
        setSuccess('');
        setIsEditing(false);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    const modalVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
        exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
    };
    const zoomVariants = {
        hidden: { opacity: 0, scale: 0.5 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } }
    };
    if (!user) return null;
    const currentPhotoUrl = photoPreview || (user.photo ? `${import.meta.env.VITE_API_URL}/uploads/users/${user.photo}` : "https://placehold.co/400");
    return (
        <>
            <AnimatePresence>
                {show && (
                    <motion.div
                        className='fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50'
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={modalVariants}
                        onClick={onClose}
                    >
                        <motion.div
                            className='bg-white w-full max-w-md mx-4 rounded-xl shadow-xl p-6 relative text-gray-700 max-h-[90vh] overflow-y-auto'
                            variants={modalVariants}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className='absolute top-4 right-4 text-gray-500 hover:text-black transition-colors duration-200'
                                onClick={onClose}
                                disabled={loading}
                            >
                                <X size={20} />
                            </button>
                            <motion.h2
                                className='text-xl font-bold mb-6'
                                variants={itemVariants}
                            >
                                Profile
                            </motion.h2>

                            {/* Alert Messages */}
                            {error && (
                                <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm'>
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className='mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm'>
                                    {success}
                                </div>
                            )}

                            <div className='space-y-4'>
                                {/* Avatar Section with Upload */}
                                <motion.div
                                    className='flex items-center space-x-4'
                                    variants={itemVariants}
                                >
                                    <div className='relative group'>
                                        <motion.img
                                            src={currentPhotoUrl}
                                            alt="Profile"
                                            className='w-20 h-20 rounded-full border-2 border-gray-200 object-cover cursor-pointer'
                                            whileHover={{ scale: 1.05 }}
                                            transition={{ duration: 0.2 }}
                                            onClick={handlePhotoClick}
                                        />
                                        {isEditing && (
                                            <motion.div
                                                className='absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer'
                                                onClick={handlePhotoClick}
                                            >
                                                <Camera size={24} className='text-white' />
                                            </motion.div>
                                        )}
                                        {selectedPhoto && (
                                            <div className='absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1'>
                                                <Upload size={12} />
                                            </div>
                                        )}
                                    </div>

                                    <div className='flex-1'>
                                        <p className='font-semibold text-lg'>{user.username}</p>
                                        <p className='text-sm text-gray-500'>{user.email}</p>
                                        {isEditing && (
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className='text-xs text-blue-500 hover:text-blue-600 mt-1 flex items-center gap-1'
                                                disabled={loading}
                                            >
                                                <Upload size={12} />
                                                Change Photo
                                            </button>
                                        )}
                                    </div>

                                    {/* Hidden file input */}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className='hidden'
                                    />
                                </motion.div>

                                {/* Position Section */}
                                <motion.div variants={itemVariants}>
                                    <label className='block text-sm font-medium mb-1'>Position</label>
                                    <p className='text-gray-600 bg-gray-100 px-3 py-2 rounded-md'>
                                        {user.posisi || 'Not set'}
                                    </p>
                                </motion.div>

                                {/* Editable Fields */}
                                {isEditing ? (
                                    <motion.div
                                        className='space-y-4'
                                        initial="hidden"
                                        animate="visible"
                                        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                                    >
                                        {/* Username */}
                                        <motion.div variants={itemVariants}>
                                            <label className='block text-sm font-medium mb-1'>Username</label>
                                            <input
                                                type='text'
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                                disabled={loading}
                                            />
                                        </motion.div>

                                        {/* Phone Number */}
                                        <motion.div variants={itemVariants}>
                                            <label className='block text-sm font-medium mb-1'>Phone Number</label>
                                            <input
                                                type='text'
                                                value={noHp}
                                                onChange={(e) => setNoHp(e.target.value)}
                                                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                                disabled={loading}
                                            />
                                        </motion.div>

                                        {/* New Password */}
                                        <motion.div variants={itemVariants}>
                                            <label className='block text-sm font-medium mb-1'>
                                                New Password <span className='text-gray-400'>(optional)</span>
                                            </label>
                                            <div className='relative'>
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder='Leave empty to keep current password'
                                                    className='w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                                    disabled={loading}
                                                />
                                                <button
                                                    type='button'
                                                    onClick={togglePasswordVisibility}
                                                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
                                                    disabled={loading}
                                                >
                                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>
                                        </motion.div>

                                        {/* Action Buttons */}
                                        <div className='flex gap-2 pt-2'>
                                            <motion.button
                                                onClick={handleSave}
                                                className='flex-1 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center'
                                                whileHover={{ scale: loading ? 1 : 1.02 }}
                                                whileTap={{ scale: loading ? 1 : 0.98 }}
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <Loader2 size={16} className='animate-spin mr-2' />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save size={16} className='mr-2' />
                                                        Save Changes
                                                    </>
                                                )}
                                            </motion.button>
                                            <motion.button
                                                onClick={handleCancel}
                                                className='flex-1 bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed'
                                                whileHover={{ scale: loading ? 1 : 1.02 }}
                                                whileTap={{ scale: loading ? 1 : 0.98 }}
                                                disabled={loading}
                                            >
                                                Cancel
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.button
                                        onClick={() => setIsEditing(true)}
                                        className='w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors duration-200'
                                        variants={itemVariants}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Edit size={16} className='inline mr-2' /> Edit Profile
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Photo Zoom Modal */}
            <AnimatePresence>
                {showPhotoZoom && (
                    <motion.div
                        className='fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-60'
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={zoomVariants}
                        onClick={() => setShowPhotoZoom(false)}
                    >
                        <motion.div
                            className='relative max-w-2xl max-h-[90vh] p-4'
                            onClick={(e) => e.stopPropagation()}
                            variants={zoomVariants}
                        >
                            <button
                                className='absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors'
                                onClick={() => setShowPhotoZoom(false)}
                            >
                                <X size={32} />
                            </button>
                            <motion.img
                                src={currentPhotoUrl}
                                alt="Profile Zoom"
                                className='max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain'
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ProfileDialog;