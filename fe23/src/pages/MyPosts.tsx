import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal } from 'antd';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase';
import { Layout } from 'antd';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import Sidebar from '../components/sidebar';


const PageContainer = styled(Layout)`
  display: flex;
  min-height: 100vh;
`;

// Replace 'YourRecordType' with the actual type/interface of your post record
interface YourRecordType {
  id: string;
  title: string;
  content: string;
  // Add other properties as needed
  comments?: {
    id: string;
    content: string;
  }[];
}

const MyPostsPage: React.FC = () => {
  const [posts, setPosts] = useState<YourRecordType[]>([]);
  const [comments, setComments] = useState<string[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const currentUser = useSelector((state: any) => state.auth.user);
  const email = currentUser.email;

  const fetchPosts = async (userEmail: string) => {
    try {
      const postsCollection = collection(firestore, 'posts');
      const postQuery = query(postsCollection, where('email', '==', userEmail));

      const postsSnapshot = await getDocs(postQuery);

      const filteredPosts: YourRecordType[] = [];

      postsSnapshot.forEach((doc) => {
        const postData: YourRecordType = { id: doc.id, ...doc.data() } as YourRecordType;
        filteredPosts.push(postData);
      });

      setPosts(filteredPosts);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchComments = (postId: string) => {
    try {
      // Find the post with the given postId
      const post = posts.find((post) => post.id === postId);

      if (post && post.comments && post.comments.length > 0) {
        // Map through comments and extract content
        const commentsForPost = post.comments.map((comment) => comment.content || '');
        setComments(commentsForPost);
      } else {
        setComments([]);
      }
    } catch (error: any) {
      console.error('Error fetching comments:', error.message);
    }
  };

  useEffect(() => {
    fetchPosts(email);
  }, [email]);

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Content', dataIndex: 'content', key: 'content' },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: string, record: YourRecordType) => (
        <Space>
          <Button onClick={() => handleEdit(record)}>Edit</Button>
          <Button onClick={() => handleDelete(record)}>Delete</Button>
        </Space>
      ),
    },
  ];

  const expandableRow = {
    expandedRowRender: (record: YourRecordType) => (
      <div>
        {comments.map((comment, index) => (
          <div key={index}>{comment}</div>
        ))}
      </div>
    ),
    onExpand: (expanded: any, record: YourRecordType) => {
      if (expanded) {
        fetchComments(record.id);
        setExpandedRowKeys([...expandedRowKeys, record.id]);
      } else {
        setExpandedRowKeys(expandedRowKeys.filter((key) => key !== record.id));
      }
    },
  };

  const handleEdit = (record: YourRecordType) => {
    Modal.info({
      title: 'Edit Post',
      content: <div>Edit form goes here</div>,
    });
  };

  const handleDelete = (record: YourRecordType) => {
    Modal.confirm({
      title: 'Delete Post',
      content: 'Are you sure you want to delete this post?',
      onOk: () => {
        // Implement delete logic here
        // You might want to update the 'posts' state after deletion
      },
    });
  };

  return (
  <>
  <PageContainer>
  <Sidebar/>
  <Table
      dataSource={posts}
      columns={columns}
      expandable={expandableRow}
      rowKey="id"
      // Add other table props as needed
    />
    </PageContainer>
  </>
  );
};

export default MyPostsPage;
