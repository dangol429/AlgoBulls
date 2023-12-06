import React, { useState, useEffect } from 'react';
import { Card, Avatar, Button, Input, Tooltip } from 'antd';
import { Comment } from '@ant-design/compatible';
import {
  EditOutlined,
  DeleteOutlined,
  LikeOutlined,
  LikeFilled,
  MessageOutlined,
  BookOutlined,
  BookFilled,
} from '@ant-design/icons';
import { firestore } from '../firebase';
import styled from 'styled-components';
import useCurrentUser from '../firebase/currentUser'
import { useSelector } from 'react-redux'
import firebase from 'firebase/app';
import 'firebase/firestore';
import { doc, updateDoc, getDocs, arrayUnion, where, query, collection, onSnapshot, FieldValue, Timestamp } from 'firebase/firestore';

// interface PostComment {
//   commentedBy: { firstName: string; lastName: string; profilePicture: string }; // Add the necessary fields for the commenter
//   comment: string;
// }

const { Meta } = Card;

const CommentsContainer = styled.div`
margin-top: 20px;
`;


const CommentButton = styled(Button)`
  background-color: #1890ff; /* Primary button color */
  color: white;
  border: none;
  border-radius: 8px;
  &:hover {
    background-color: #096dd9; /* Button color on hover */
  }
`;
const StyledComment = styled(Comment)`
  background-color: #f0f2f5;
  margin-bottom: 10px;
  border-radius: 30px;
  padding-left: 20px;
  padding-right: 10px;
`


const CommentTextArea = styled(Input.TextArea)`
  margin-bottom: 8px;
  resize: none !important;
  background-color: white; /* White background for the text area */
  padding: 10px;
  border-radius: 8px;
  transition: height 0.3s; /* Add transition for height change */
`;


const StyledCard = styled(Card)`
  width: 700px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 2rem
`;

const ActionButton = styled(Button)`
  margin-top: 10px;
  margin-right: 10px;
`;

const CountWrapper = styled.span`
  margin-right: 10px;
`;

const Changes = styled.div`
  display: inline;
  position: relative;

`;
const Bookmarks = styled.div`
display: flex;
align-items: center;
margin-bottom: 10px;

.ant-btn {
  border: none;
  background-color: transparent;
  color: #555;

  &:hover {
    background-color: #f0f0f0;
  }

  &.ant-btn-primary {
    background-color: #1890ff;
    color: #fff;

    &:hover {
      background-color: #1890ff;
    }
  }
}
`;

const LikeContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  margin-left: 10px;
  font-size: 20px;
  .ant-btn {
    border: none;
    background-color: transparent;
    color: #555;

    &:hover {
      background-color: #f0f0f0;
    }

    &.ant-btn-primary {
      background-color: #1890ff;
      color: #fff;

      &:hover {
        background-color: #1890ff;
      }
    }
  }
`;
const CommentContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  
  .ant-btn {
    border: none;
    background-color: transparent;
    color: #555;

    &:hover {
      background-color: #f0f0f0;
    }

    &.ant-btn-primary {
      background-color: #1890ff;
      color: #fff;

      &:hover {
        background-color: #1890ff;
      }
    }
  }
`;
const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 500px;
  height: 40px;
  
`;
const CustomAvatar = styled(Avatar)`
  margin-top: 10px;
  width: 50px;
  height: 50px;
`;

const CustomTitle = styled.div`
  margin-top: 10px;
`;
const CustomDateSpan = styled.span`
  color: gray;
  font-size: 12px;
  margin-left: 4rem;
`;

const Line = styled.hr`
   color: #f1f1f1; 
   font-size: 0.2px;
   width: 700px;
`

const NumbersContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 600px;
  margin:auto;
  height: 40px;
`
const CommentNumber = styled.div`
`
const BookmarkNumber = styled.div`
  
`
const LikeNumber = styled.div`
  margin-left: 20px;
`



const Post = ({ post, currentUser, onDelete, onUpdate, onComment, onLike, onDislike , Likes, onBookmark, onUnbookmark }: { post: any; currentUser: any; onDelete: any; onUpdate: any; onComment: any ; onLike: any; Likes:any; onDislike : any; onBookmark: any; onUnbookmark : any;}) => {
  const [isLiked, setLiked] = useState(false);
  const [isBookmarked, setBookmarked] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<{ author: string; content: string }[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [likeNumber, setLikeNumber] = useState(0);
  const [bookmarkNumber, setBookmarkNumber] = useState(0);

  const CurrentUser = useSelector((state: any) => state.auth.user);
  const [expanded, setExpanded] = useState(false)
  const PostId = post.post_id

  
  const fetchLikeNumber = async (post_id: any) => {
    try {
      const LikesCollection = collection(firestore, 'Likes');
      const likesQuery = query(LikesCollection, where('post_id', '==', post_id));
      const LikesSnapshot = await getDocs(likesQuery);
  
      if (LikesSnapshot.empty) {
        console.log('No likes for this post.');
        setLikeNumber(0);
      } else {
        // Calculate the total number of likes for the specified post
        const totalLikes = LikesSnapshot.docs[0].data().likedBy.length;
        console.log('Total Likes:', totalLikes);
        setLikeNumber(totalLikes);
      }
    } catch (error: any) {
      console.error('Error fetching like number:', error.message);
      // Handle the error as needed
    }
  };

  const fetchLikeState = async (post_id: any) => {
    try {
      const LikesCollection = collection(firestore, 'Likes');
      const likesQuery = query(LikesCollection, where('post_id', '==', post_id));
      const LikesSnapshot = await getDocs(likesQuery);
  
      if (LikesSnapshot.empty) {
        // No likes for the specified post, set isLiked to false
        return false;
      }
  
      // Get the likedBy array from the first document
      const likedByArray = LikesSnapshot.docs[0].data().likedBy;
      // Check if the current user's email exists in the likedBy array
      const Liked = likedByArray.some((likedBy: any) => {
        return likedBy.email === CurrentUser.email;
      });
      console.log('Is liked:', isLiked);
      if(Liked){
        setLiked(true);
      }
    } catch (error: any) {
      console.error('Error fetching like state:', error.message);
      return false; // Assuming an error means the post is not liked
    }
  };

  const fetchBookmarkNumber = async (post_id: any) => {
    try {
      const BookmarksCollection = collection(firestore, 'Bookmarks');
      const bookmarksQuery = query(BookmarksCollection, where('post_id', '==', post_id));
      const BookmarksSnapshot = await getDocs(bookmarksQuery);
  
      if (BookmarksSnapshot.empty) {
        console.log('No bookmarks for this post.');
        setBookmarkNumber(0);
      } else {
        // Calculate the total number of bookmarks for the specified post
        const totalBookmarks = BookmarksSnapshot.docs[0].data().bookmarkedBy.length;
        console.log('Total Bookmarks:', totalBookmarks);
        setBookmarkNumber(totalBookmarks);
      }
    } catch (error: any) {
      console.error('Error fetching bookmark number:', error.message);
      // Handle the error as needed
    }
  };
  
  const fetchBookmarkState = async (post_id: any) => {
    try {
      const BookmarksCollection = collection(firestore, 'Bookmarks');
      const bookmarksQuery = query(BookmarksCollection, where('post_id', '==', post_id));
      const BookmarksSnapshot = await getDocs(bookmarksQuery);
  
      if (BookmarksSnapshot.empty) {
        // No bookmarks for the specified post, set isBookmarked to false
        return false;
      }
  
      // Get the bookmarkedBy array from the first document
      const bookmarkedByArray = BookmarksSnapshot.docs[0].data().bookmarkedBy;
      // Check if the current user's email exists in the bookmarkedBy array
      const Bookmarked = bookmarkedByArray.some((bookmarkedBy: any) => {
        return bookmarkedBy.email === CurrentUser.email;
      });
      console.log('Is bookmarked:', Bookmarked);
      if (Bookmarked) {
        setBookmarked(true);
      }
    } catch (error: any) {
      console.error('Error fetching bookmark state:', error.message);
      return false; // Assuming an error means the post is not bookmarked
    }
  };
  
  
  

  useEffect(()=> {
    fetchLikeState(PostId)
    fetchLikeNumber(PostId)
  }, [])

  useEffect(()=> {
    fetchBookmarkState(PostId)
    fetchBookmarkNumber(PostId)
  }, [])
  
  const handleLike = () => {
    if(!isLiked){
      onLike(CurrentUser, PostId)
      setLiked((prev) => !prev);
    }else{
      onDislike(CurrentUser, PostId)
      setLiked((prev) => !prev);
    }
    setTimeout((() => fetchLikeNumber(PostId)), 300)
  };

  const handleBookmark = () => {
    if(!isBookmarked){
      onBookmark(CurrentUser, PostId)
      setBookmarked((prev) => !prev)
    }else{
      onUnbookmark(CurrentUser, PostId)
      setBookmarked((prev) => !prev)
    }
    setTimeout((() => fetchBookmarkNumber(PostId)), 300)
  }

  const handleComment = async (PostId: string, newComment: { author: string; content: string }) => {
    setComment('');

    // Call the onComment callback to inform Home component about the new comment
    onComment(PostId, { author: CurrentUser , content: comment });
  };
  
  
  const toggleComments = () => {
    setShowComments(!showComments);
  };

  

  return (
    <StyledCard>
      <Meta
        avatar={<CustomAvatar src={`https://imgs.search.brave.com/urFMoUegY-9Mpwe5mrqJBpymMMLdz21sjeh7XIry4gE/rs:fit:860:0:0/g:ce/aHR0cHM6Ly93aGlj/aGZhY2Vpc3JlYWwu/YmxvYi5jb3JlLndp/bmRvd3MubmV0L3B1/YmxpYy9mYWtlaW1h/Z2VzL2ltYWdlLTIw/MTktMDItMTdfMDI1/ODU0LmpwZWc`} />}
        title={<CustomTitle>{`${post.author.firstName} ${post.author.lastName}`}</CustomTitle>}
        description={
          <>
          <CustomDateSpan>
            {new Date(post.createdAt.toDate()).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })} at {new Date(post.createdAt.toDate()).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
            })}
          </CustomDateSpan>
            <p style={{ color: 'black' }} key={post.createdAt}>
              {post.content}
            </p>
            <div>
              <NumbersContainer>
                <LikeNumber>
                  <CountWrapper> {likeNumber} Likes</CountWrapper>
                </LikeNumber>
                <CommentNumber>
                  <CountWrapper>{post.comments.length + comments.length} Comments</CountWrapper>
                  <CountWrapper>{bookmarkNumber} Bookmarks</CountWrapper>
                </CommentNumber>
              </NumbersContainer>
              <Line />
              <ButtonsContainer>
                <LikeContainer>
                  <ActionButton
                    style = {{ width: '200px'}}
                    icon={isLiked ? <LikeFilled /> : <LikeOutlined />}
                    onClick={handleLike}
                    className={isLiked ? 'ant-btn ant-btn-primary' : 'ant-btn'}
                  >
                    {isLiked ? 'Unlike' : 'Like'}
                  </ActionButton>
                </LikeContainer>
                <CommentContainer>
                  <ActionButton
                    style = {{ width: '200px'}}
                    icon={<MessageOutlined />}
                    onClick={toggleComments}
                    className={showComments ? 'ant-btn ant-btn-primary' : 'ant-btn'}
                  >
                    Comment
                  </ActionButton>
                </CommentContainer>
                <Bookmarks>
                  <ActionButton
                    style = {{ width: '200px'}}
                    icon={isBookmarked ? <BookFilled /> : <BookOutlined />}
                    onClick={handleBookmark}
                    className={isBookmarked ? 'ant-btn ant-btn-primary' : 'ant-btn'}
                  >Bookmark</ActionButton>
                </Bookmarks>
                {/* ... (Other elements) */}
              </ButtonsContainer>
                {/* <Changes>
                  {currentUser.email === post.email && (
                    <>
                      <ActionButton icon={<EditOutlined />} onClick={() => onUpdate(post)}>
                      </ActionButton>
                      <ActionButton icon={<DeleteOutlined />} onClick={() => onDelete(post)}>
                      </ActionButton>
                    </>
                  )}
                </Changes> */}
              <Line/>
              
              <CommentsContainer>
                {post.comments.map((comment : any) => (
                  <StyledComment author={comment.author.first_name + " " + comment.author.last_name} content={comment.content} />
                ))}
                <CommentTextArea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  // onClick = {GetBig}
                >
                  </CommentTextArea>
                  <CommentButton onClick={() => handleComment(PostId, { author: CurrentUser, content: comment })}>
                  Comment
                </CommentButton>
              </CommentsContainer>

            </div>
          </>
        }
      />
    </StyledCard>
  );
};

export default Post;


