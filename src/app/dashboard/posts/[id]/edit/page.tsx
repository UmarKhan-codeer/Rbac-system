// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';

// const postSchema = z.object({
//     title: z.string().min(1, 'Title is required'),
//     content: z.string().min(1, 'Content is required'),
// });

// type PostFormData = z.infer<typeof postSchema>;

// export default function EditPostPage({ params }: { params: { id: string } }) {
//     const router = useRouter();
//     const [error, setError] = useState<string | null>(null);
//     const [loading, setLoading] = useState(true);

//     const {
//         register,
//         handleSubmit,
//         setValue,
//         formState: { errors, isSubmitting },
//     } = useForm<PostFormData>({
//         resolver: zodResolver(postSchema),
//     });

//     useEffect(() => {
//         const fetchPost = async () => {
//             try {
//                 const res = await fetch(`/api/posts/${params.id}`);
//                 if (!res.ok) throw new Error('Failed to fetch post');
//                 const post = await res.json();
//                 setValue('title', post.title);
//                 setValue('content', post.content);
//             } catch (err) {
//                 console.error(err);
//                 setError('Failed to load post');
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchPost();
//     }, [params.id, setValue]);

//     const onSubmit = async (data: PostFormData) => {
//         setError(null);
//         try {
//             const res = await fetch(`/api/posts/${params.id}`, {
//                 method: 'PUT',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(data),
//             });

//             if (!res.ok) {
//                 throw new Error('Failed to update post');
//             }

//             router.push('/dashboard/posts');
//             router.refresh();
//         } catch (err: any) {
//             setError(err.message);
//         }
//     };

//     if (loading) return <div>Loading...</div>;

//     return (
//         <div className="max-w-2xl mx-auto">
//             <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Post</h1>

//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white shadow rounded-lg p-6">
//                 <div>
//                     <label htmlFor="title" className="block text-sm font-medium text-gray-700">
//                         Title
//                     </label>
//                     <input
//                         {...register('title')}
//                         type="text"
//                         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
//                     />
//                     {errors.title && (
//                         <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
//                     )}
//                 </div>

//                 <div>
//                     <label htmlFor="content" className="block text-sm font-medium text-gray-700">
//                         Content
//                     </label>
//                     <textarea
//                         {...register('content')}
//                         rows={4}
//                         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
//                     />
//                     {errors.content && (
//                         <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>
//                     )}
//                 </div>

//                 {error && <div className="text-red-500 text-sm">{error}</div>}

//                 <div className="flex justify-end">
//                     <button
//                         type="button"
//                         onClick={() => router.back()}
//                         className="mr-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         type="submit"
//                         disabled={isSubmitting}
//                         className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
//                     >
//                         {isSubmitting ? 'Saving...' : 'Save Changes'}
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// }




'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const postSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    slug: z.string().min(1, 'Slug is required'),
    content: z.string().min(1, 'Content is required'),
    image: z.any().optional(),
});

type PostFormData = z.infer<typeof postSchema>;

export default function EditPostPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<PostFormData>({
        resolver: zodResolver(postSchema),
    });

    const generateSlug = (value: string) => {
        return value
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove invalid chars
            .trim()
            .replace(/\s+/g, '-'); // Replace spaces with -
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setValue('title', value);
        setValue('slug', generateSlug(value));
    };

    const [currentImage, setCurrentImage] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchPost = async () => {
            try {
                const res = await fetch(`/api/posts/${id}`, {
                    cache: 'no-store',
                });

                if (!res.ok) throw new Error('Failed to fetch post');

                const post = await res.json();

                setValue('title', post.title);
                setValue('slug', post.slug || generateSlug(post.title)); // Fallback if slug missing
                setValue('content', post.content);
                setCurrentImage(post.image || null);
            } catch (err) {
                console.error(err);
                setError('Failed to load post');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id, setValue]);

    const onSubmit = async (data: PostFormData) => {
        setError(null);
        try {
            let imageUrl = currentImage;
            if (data.image && data.image[0]) {
                const formData = new FormData();
                formData.append('file', data.image[0]);

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadRes.ok) {
                    throw new Error('Failed to upload image');
                }

                const uploadData = await uploadRes.json();
                imageUrl = uploadData.path;
            }

            const postData = {
                ...data,
                image: imageUrl,
            };

            const res = await fetch(`/api/posts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData),
            });

            if (!res.ok) {
                throw new Error('Failed to update post');
            }

            router.push('/dashboard/posts');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Post</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white shadow rounded-lg p-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Title
                    </label>
                    <input
                        {...register('title')}
                        onChange={handleTitleChange}
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 p-2"
                    />
                    {errors.title && (
                        <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Slug
                    </label>
                    <input
                        {...register('slug')}
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 p-2 bg-gray-50"
                    />
                    {errors.slug && (
                        <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Content
                    </label>
                    <textarea
                        {...register('content')}
                        rows={4}
                        className="mt-1 block w-full rounded-md border-gray-300 p-2"
                    />
                    {errors.content && (
                        <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Image
                    </label>
                    <input
                        {...register('image')}
                        type="file"
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                    />
                    {currentImage && (
                        <div className="mt-4">
                            <p className="text-sm text-gray-500">Current image:</p>
                            <img src={currentImage} alt="Current post image" className="mt-2 h-32 w-auto rounded" />
                        </div>
                    )}
                    {errors.image && (
                        <p className="text-red-500 text-xs mt-1">{(errors.image as any).message}</p>
                    )}
                </div>

                {error && <div className="text-red-500 text-sm">{error}</div>}

                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="mr-3 rounded-md bg-white px-3 py-2 text-sm shadow ring-1 ring-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white disabled:opacity-50"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
