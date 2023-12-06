import React, { useState, useEffect } from 'react';
import { Layout, Input, Button } from 'antd';
import Sidebar from '../components/sidebar';
import Posts from '../components/posts';
import styled from 'styled-components';
import createPost from '../firebase/createPost';
import useCurrentUser from '../firebase/currentUser';
import { useSelector } from 'react-redux';
import { doc, updateDoc, deleteDoc, addDoc, getDocs, arrayUnion, where, query, collection, onSnapshot, FieldValue, Timestamp } from 'firebase/firestore';
import { firestore } from '../firebase'; // Assuming your firestore instance is exported as `firestore`
import { v4 as uuidv4 } from 'uuid';



const { Content } = Layout;

const PostInputContainer = styled.div`
  width: 700px;
  margin-left: auto;
  margin-right: auto;
`;

const StyledHeading = styled.h1`
  color: black;
  font-family: 'Your Preferred Font', sans-serif; /* Specify your preferred font */
  font-size: 2rem; 
  font-weight: bold; 
  width: 700px;
  margin-left:auto;
  margin-right:auto;
`;


const HOME = () => {
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState<any[]>([]); // Assuming 'any' as the type for your posts. You might want to replace it with the actual type.
  const [dummyState, setDummyState] = useState(false);
  const [Likes, setLikes] = useState<any[]>([]);


  // Assuming samplePosts is defined somewhere in your code
  // const samplePosts = ...

  const CurrentUser = useSelector((state: any) => state.auth.user);
  const email = CurrentUser.email;
  const first_name = CurrentUser.first_name;
  const last_name = CurrentUser.last_name;

  const handleDelete = (post: any) => {
    // Implement post deletion logic here
    console.log('Delete post:', post);
  };

  const handleUpdate = (post: any) => {
    // Implement post update logic here
    console.log('Update post:', post);
  };

  const generatePostId = () => {
    return uuidv4();
  };
  

  const fetchPosts = async () => {
    try {
      const postsCollection = collection(firestore, 'posts');
      const postsSnapshot = await getDocs(postsCollection);
      const fetchedPosts = postsSnapshot.docs.map((doc: any) => doc.data());
      setPosts(fetchedPosts);
    } catch (error: any) {
      console.error('Error fetching posts:', error.message);
    }
  };
  
  // const fetchLikes = async () => {
  //   try {
  //     const LikesCollection = collection(firestore, 'Likes');
  //     const LikesSnapshot = await getDocs(LikesCollection);
  //     const LikedPosts = LikesSnapshot.docs.map((doc : any) => doc.data());
  //     setLikes(LikedPosts);
  //     console.log(LikedPosts)
  //   } catch (error: any) {
  //     console.error('Error fetching Likes:', error.message);
  //   }
  // };


  useEffect(() => {
    fetchPosts();
  }, [newPost, dummyState]); // Run the effect whenever newPost changes
  

  const handlePost = () => {
    if (newPost.trim() !== '') {
      const newPostObject = {
        post_id: uuidv4(),
        email: email,
        content: newPost,
        author: {
          firstName: first_name,
          lastName: last_name,
          email: email,
        },
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: null,
        comments: [],
      };
  
      createPost(newPostObject);
      setNewPost('');
    }
  };
  const handleComment = async (PostId: string, newComment: { author: string; content: string }) => {
    try {
        const postsCollection = collection(firestore, 'posts');

        // Create a query to find the document with the matching post_id
        const postQuery = query(postsCollection, where('post_id', '==', PostId));

        // Execute the query and get the documents
        const querySnapshot = await getDocs(postQuery);
        // Check if there is a matching document
        if (!querySnapshot.empty) {
          // Get the reference to the first document in the result set
          const postDocRef = querySnapshot.docs[0].ref;
          // Now you can update the comments array in that document
          await updateDoc(postDocRef, {
            comments: arrayUnion(newComment),
            updatedAt: Timestamp.fromDate(new Date()),
          });
          setDummyState((prev) => !prev);
        } else {
          console.error(`Document with post_id ${PostId} does not exist.`);
        }
    } catch (error) {
      console.error('Error adding comment to Firestore', error);
    }
  };

 const handleLike = async ( LikeData : any, post_id: any)=> {
      try {
       const LikesCollection = collection(firestore, 'Likes');
    
      // Add the post data to the collection
      const likesQuery = query(LikesCollection, where('post_id', '==', post_id));
      const likesSnapshot = await getDocs(likesQuery);

      if (!likesSnapshot.empty) {
      // If the post_id is present, update the existing document
      const likeDocRef = likesSnapshot.docs[0].ref;
      await updateDoc(likeDocRef, {
        likedBy: arrayUnion(LikeData),
        LikedEmails: arrayUnion(LikeData.email)
      });
      } else {
        // If the post_id is not present, add a new document
        await addDoc(LikesCollection, {
          post_id,
          likedBy: [LikeData],
          LikedEmails: [LikeData.email]
        });
    setDummyState((prev) => !prev);
    console.log('Liked successfully!');
  }
 } catch (error: any) {
    console.error('Error Liking:', error.message);
  }
};

const handleDislike = async (LikeData : any , post_id : any ) => {
  try {
    const LikesCollection = collection(firestore, 'Likes');
    
    // Create a query to find the document to dislike
    const dislikeQuery = query(LikesCollection, where('post_id', '==', post_id));
    
    // Execute the query
    const querySnapshot = await getDocs(dislikeQuery);
    
    if (!querySnapshot.empty) {
      // Iterate through the documents in the result set
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        
        // Find the index of the likedBy object with the matching email
        const index = data.likedBy.findIndex((likedBy: any) => likedBy.email === LikeData.email);
        
        if (index !== -1) {
          // Remove the likedBy object from the array
          data.likedBy.splice(index, 1);

          data.LikedEmails = data.LikedEmails.filter((email: string) => email !== LikeData.email);
          await updateDoc(doc.ref, { LikedEmails: data.LikedEmails });
          
          // Update the document in Firestore
          await updateDoc(doc.ref, { likedBy: data.likedBy });
          
          // Trigger a state change to refresh the UI
          setDummyState((prev) => !prev);
          
          console.log(`Unliked Successfully with post_id ${post_id} and author ${LikeData.email} deleted successfully.`);
          
          return; // Exit the loop once the dislike is handled
        }
      }
      
      console.error(`Problem with post_id ${post_id} and author ${LikeData.email} not found.`);
    } else {
      console.error(`Problem with post_id ${post_id} not found.`);
    }
  } catch (error) {
    console.error('Error deleting like from Firestore', error);
  }
}

const handleBookmark = async (bookmarkData : any, post_id: any) => {
  try {
    const BookmarksCollection = collection(firestore, 'Bookmarks');

    // Add the post data to the collection
    const bookmarksQuery = query(BookmarksCollection, where('post_id', '==', post_id));
    const bookmarksSnapshot = await getDocs(bookmarksQuery);

    if (!bookmarksSnapshot.empty) {
      // If the post_id is present, update the existing document
      const bookmarkDocRef = bookmarksSnapshot.docs[0].ref;
      await updateDoc(bookmarkDocRef, {
        bookmarkedBy: arrayUnion(bookmarkData),
        BookmarkedEmails: arrayUnion(bookmarkData.email),
      });
    } else {
      // If the post_id is not present, add a new document
      await addDoc(BookmarksCollection, {
        post_id,
        bookmarkedBy: [bookmarkData],
        BookmarkedEmails: [bookmarkData.email],
      });
    }
    setDummyState((prev) => !prev);
    console.log('Bookmarked successfully!');
  } catch (error: any) {
    console.error('Error Bookmarking:', error.message);
  }
};

const handleUnbookmark = async (bookmarkData: any, post_id: any) => {
  try {
    const BookmarksCollection = collection(firestore, 'Bookmarks');

    // Create a query to find the document to unbookmark
    const unbookmarkQuery = query(BookmarksCollection, where('post_id', '==', post_id));

    // Execute the query
    const querySnapshot = await getDocs(unbookmarkQuery);

    if (!querySnapshot.empty) {
      // Iterate through the documents in the result set
      for (const doc of querySnapshot.docs) {
        const data = doc.data();

        // Find the index of the BookmarkedEmails in the array
        const index = data.bookmarkedBy.findIndex((bookmarkedBy: any) => bookmarkedBy.email=== bookmarkData.email)

        if (index !== -1) {
          // Remove the email from the BookmarkedEmails array
          data.bookmarkedBy.splice(index, 1);

          data.BookmarkedEmails = data.BookmarkedEmails.filter((email: string) => email !== bookmarkData.email);
          // Update the document in Firestore
          await updateDoc(doc.ref, { BookmarkedEmails: data.BookmarkedEmails });

          await updateDoc(doc.ref, { bookmarkedBy: data.bookmarkedBy });
          // Trigger a state change to refresh the UI
          setDummyState((prev) => !prev);

          console.log(`Unbookmarked Successfully with post_id ${post_id} and author ${bookmarkData.email} removed successfully.`);

          return; // Exit the loop once the unbookmark is handled
        }
      }

      console.error(`Problem with post_id ${post_id} and author ${bookmarkData.email} not found.`);
    } else {
      console.error(`Problem with post_id ${post_id} not found.`);
    }
  } catch (error: any) {
    console.error('Error deleting bookmark from Firestore', error);
  }
};



  return (
    <Layout style={{ minHeight: '98vh' }}>
      <Sidebar />
      <Layout>
      <StyledHeading>What's Happening? {CurrentUser.first_name}</StyledHeading>
        <PostInputContainer>
          <Input style={{ height: '70px', marginBottom: '10px' }} placeholder="Write a new post" value={newPost} onChange={(e) => setNewPost(e.target.value)} />
          <Button style={{ float: 'right' , width: '70px'}} type="primary" onClick={handlePost}>
            Post
          </Button>
        </PostInputContainer>
        <Content style={{ padding: '24px' }}>
          {posts.map((post: any) => (
            <Posts
              key={post.post_id}
              post={post}
              currentUser={{ CurrentUser }}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              onComment = {handleComment}
              onLike = {handleLike}
              Likes = {Likes}
              onDislike = {handleDislike}
              onBookmark = {handleBookmark}
              onUnbookmark = {handleUnbookmark}
            />
          ))}
        </Content>
      </Layout>
    </Layout>
  );
};

export default HOME;
