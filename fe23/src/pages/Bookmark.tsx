import React, { useState, useEffect } from 'react';
import { Layout, Card, Avatar, Button } from 'antd';
import styled from 'styled-components';
import Sidebar from '../components/sidebar';
import { useSelector } from 'react-redux';
import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { firestore } from '../firebase';

const { Meta } = Card;
const { Content } = Layout;

// Define types for Post and BookmarkedPostData
interface Post {
  post_id: string;
  email: string;
  content: string;
  author: {
    firstName: string;
    lastName: string;
    email: string;
  };
  comments: string[];
}

interface BookmarkedPostData {
  id: string;
  BookmarkedEmails: string[];
  bookmarkedBy: {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
  }[];
  post_id: string;
  postDetails?: Post;
}

// Define styled components
const PageContainer = styled(Layout)`
  display: flex;
`;

const ContentContainer = styled(Content)`
  flex: 1;
  padding: 20px;
  margin-left: 25rem;
  margin-right: 25rem;
`;

const StyledCard = styled(Card)`
  margin-bottom: 20px;

  .ant-card-meta-description {
    padding: 10px 0; /* Added padding to the post content */
  }
`;

const BookmarkButton = styled(Button)`
  margin-top: 10px;
  background-color: #1890ff; /* Changed the color to Ant Design primary blue */
  border-color: #1890ff;
  color: #fff;
`;

const BookmarkPage: React.FC = () => {
  // State to store bookmarked posts
  const [bookmarkedPosts, setBookmarkedPosts] = useState<BookmarkedPostData[]>([]);
  const CurrentUser = useSelector((state: any) => state.auth.user);
  const [dummyState, setDummyState] = useState<boolean>(false);

  // Redux state to check authentication
  const { isAuthenticated, user } = useSelector((state: any) => state.auth);

  // Effect to fetch bookmarked posts when the component mounts
  useEffect(() => {
    const fetchBookmarkedPosts = async () => {
      try {
        // Query to get bookmarked posts
        const bookmarksQuery = query(collection(firestore, 'Bookmarks'));
        const bookmarksSnapshot = await getDocs(bookmarksQuery);

        // Array to store bookmarked posts
        const bookmarkedPostsData: BookmarkedPostData[] = [];

        // Iterate through each bookmark document
        for (const doc of bookmarksSnapshot.docs) {
          const bookmarkedPost = doc.data() as BookmarkedPostData;

          // Check if the current user has bookmarked the post
          if (bookmarkedPost.BookmarkedEmails.includes(user.email)) {
            // Query to get details of the bookmarked post
            const postsCollection = collection(firestore, 'posts');
            const q = query(postsCollection, where('post_id', '==', bookmarkedPost.post_id));
            const postSnapshot = await getDocs(q);

            // If the post exists, add it to the array
            if (!postSnapshot.empty) {
              postSnapshot.forEach((doc) => {
                const postData = doc.data() as Post;
                bookmarkedPostsData.push({
                  ...bookmarkedPost,
                  postDetails: postData,
                });
              });
            }
          }
        }

        // Set the bookmarked posts in the state
        setBookmarkedPosts(bookmarkedPostsData);
      } catch (error: any) {
        console.error('Error fetching bookmarked posts:', error.message);
      }
    };

    // Fetch bookmarked posts only if the user is authenticated
    if (isAuthenticated) {
      fetchBookmarkedPosts();
    }
  }, [isAuthenticated, user]);

  const handleUnbookmarked = async (bookmarkData: any, post_id: string) => {
    console.log('handle unbookmark STARTED');
    console.log(CurrentUser.email)
    try {
      const BookmarksCollection = collection(firestore, 'Bookmarks');
  
      // Create a query to find the document to dislike
      const unbookmarkQuery = query(BookmarksCollection, where('post_id', '==', post_id));
  
      // Execute the query
      const querySnapshot = await getDocs(unbookmarkQuery);
  
      if (!querySnapshot.empty) {
        // Iterate through the documents in the result set
        console.log("moving in")
        for (const doc of querySnapshot.docs) {
          const data = doc.data();
  
          // Find the index of the likedBy object with the matching email
          const index = data.bookmarkedBy.findIndex((bookmarkedBy: any) => bookmarkedBy.email === bookmarkData.email);
  
          if (index !== -1) {
            // Remove the likedBy object from the array
            data.bookmarkedBy.splice(index, 1);
  
            // Remove the user's email from LikedEmails array
            data.BookmarkedEmails = data.BookmarkedEmails.filter((email: string) => email !== bookmarkData.email);
  
            // Update the document in Firestore
            await updateDoc(doc.ref, { bookmarkedBy: data.bookmarkedBy, BookmarkedEmails: data.BookmarkedEmails });
  
            // Trigger a state change to refresh the UI
            setBookmarkedPosts((prev) => prev.filter((bookmarkedPost) => bookmarkedPost.post_id !== post_id));
            setDummyState((prev) => !prev);
            console.log(`Disliked Successfully with post_id ${post_id} and author ${bookmarkData.email} deleted successfully.`);
  
            return; // Exit the loop once the dislike is handled
          }
        }
  
        console.error(`Problem with post_id ${post_id} and author ${bookmarkData.email} not found.`);
      } else {
        console.error(`Problem with post_id ${post_id} not found.`);
      }
    } catch (error) {
      console.error('Error deleting like from Firestore', error);
    }
  };

  return (
    <PageContainer>
      <Sidebar />
      <ContentContainer>
        <h1>My Bookmarked Posts</h1>
        {bookmarkedPosts.map((bookmarkedPost) => (
          <StyledCard key={bookmarkedPost.id}>
            <Meta
              avatar={<Avatar src={`https://placekitten.com/100/100?image=${bookmarkedPost.id}`} />}
              title={`${bookmarkedPost.postDetails?.author?.firstName ?? ''} ${
                bookmarkedPost.postDetails?.author?.lastName ?? ''
              }`}
              description={`${bookmarkedPost.postDetails?.content ?? ''}`}
            />
            <BookmarkButton onClick = {()=> handleUnbookmarked(CurrentUser, bookmarkedPost.post_id)} icon={<span role="img" aria-label="bookmark">📌</span>}>
              {bookmarkedPost.bookmarkedBy.length} Bookmarks
            </BookmarkButton>
          </StyledCard>
        ))}
      </ContentContainer>
    </PageContainer>
  );
};

export default BookmarkPage;
