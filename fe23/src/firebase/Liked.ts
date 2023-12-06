
import {collection, addDoc} from 'firebase/firestore';
import {auth, firestore} from '../firebase'

const Liked = async (LikeData: any) => {
  try {
    const LikesCollection = collection(firestore, 'Likes');

    // Add the post data to the collection
    await addDoc(LikesCollection, {
      ...LikeData
    });

    console.log('Post created successfully!');
  } catch (error: any) {
    console.error('Error creating post:', error.message);
  }
};

export default Liked;
