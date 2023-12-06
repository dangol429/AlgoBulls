// src/components/createPost.ts
import {collection, addDoc} from 'firebase/firestore';
import {auth, firestore} from '../firebase'

const createPost = async (postData: any) => {
  try {
    const postsCollection = collection(firestore, 'posts'); // Replace 'posts' with your actual collection name

    // Add the post data to the collection
    await addDoc(postsCollection, {
      ...postData
    });

    console.log('Post created successfully!');
  } catch (error: any) {
    console.error('Error creating post:', error.message);
  }
};

export default createPost;
