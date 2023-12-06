import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Layout, Form, Input, Upload, Button, message, List, Avatar } from 'antd';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import Sidebar from '../components/sidebar';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { firestore } from '../firebase';
import { Timestamp } from 'firebase/firestore';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const { Content } = Layout;

interface Posts {
  author: {
    email: string;
    firstName: string;
    lastName: string;
  };
  comments: {
    author: {
      email: string;
      first_name: string;
      last_name: string;
      password: string;
    };
    content: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }[];
  content: string;
  createdAt: Timestamp;
  email: string;
  post_id: string;
  updatedAt: Timestamp;
}

const Container = styled(Layout)`
  min-height: 100vh;
`;

const StyledContent = styled(Content)`
    margin:auto;
    width: 90%;
  padding: 24px;
`;

const Heading = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 20px;
`;

const StyledForm = styled(Form)`
  label {
    font-weight: bold;
  }

  .ant-form-item {
    margin-bottom: 20px;
  }

  .ant-upload {
    margin-top: 20px;
  }

  .ant-btn-primary {
    background-color: #1890ff;
    border-color: #1890ff;
  }
`;

const ListSection = styled.div`
  margin-top: 40px;

  h2 {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 20px;
  }

  .ant-list-item {
    border: 1px solid #f0f0f0;
    margin-bottom: 10px;
  }
`;

const MyProfilePage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const currentUser = useSelector((state: any) => state.auth.user);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  
  useEffect(() => {
    form.setFieldsValue({
      email: currentUser.email,
      first_name: currentUser.first_name,
      last_name : currentUser.last_name,
    });

    fetchPosts(currentUser.email);
  }, [currentUser, form]);

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };
  const fetchPosts = async (userEmail: string) => {
    try {
      const postsCollection = collection(firestore, 'posts');
      const postQuery = query(postsCollection, where('email', '==', userEmail));

      const postsSnapshot = await getDocs(postQuery);

      const filteredPosts: Posts[] = [];

      postsSnapshot.forEach((doc) => {
        const postData = { id: doc.id, ...doc.data() } as unknown as Posts;
        filteredPosts.push(postData as Posts);
      });

      setPosts(filteredPosts);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
    }
  };

  const uploadFile = async (file: File) => {
    console.log("Upload File")
    try {
      const storageRef = ref(storage, `profileImages/${currentUser.email}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setImageUrl(url);
    } catch (error) {
      console.error('Error uploading file:', error);
      message.error('Failed to upload file. Please try again.');
    }
  };

  const updateUserProfile = async (values: any) => {
    console.log(values.firstName)
    console.log('updateUserProfile working')
    try {
        const usersCollection = collection(firestore, 'users');
        const userQuery = query(usersCollection, where('email', '==', currentUser.email));
        const usersSnapshot = await getDocs(userQuery);
      
        if (usersSnapshot.size > 0) {
          const userDoc = usersSnapshot.docs[0];
          const userRef = doc(usersCollection, userDoc.id);
      
          await updateDoc(userRef, {
            first_name: values.firstName,
            last_name: values.lastName,
            profile_picture: imageUrl,
          });
        } else {
          console.error('User not found for email:', currentUser.email);
        }

      setEditMode(false); // Reset edit mode
    } catch (error: any) {
      console.error('Error updating user profile:', error.message);
      message.error('Failed to update user profile. Please try again.');
    }
  };

  const onFinish = async (values : any) => {
    setLoading(true);
    try {
        const values = await form.getFieldsValue()
      if (editMode) {
        await updateUserProfile(values);
      } else {
      }
      message.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error.message);
      message.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  const beforeUpload = (file: any) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  useEffect(() => {
    console.log(currentUser)
  }, [])

  return (
    <Container>
      <Sidebar />
      <Layout>
        <StyledContent>
          <Heading>My Profile</Heading>
          <StyledForm
            form={form}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            initialValues={{
              email: currentUser.email,
              firstName: currentUser.first_name,
              lastName: currentUser.last_name,
            }}
          >
            <Form.Item label="Email ID">
              <p>{currentUser.email}</p>
            </Form.Item>
            <Form.Item
              label="First Name"
              name="firstName"
              rules={[{ required: true, message: 'Please enter your first name!' }]}
            >
              <Input prefix={<UserOutlined />} readOnly={!editMode} />
            </Form.Item>
            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[{ required: true, message: 'Please enter your last name!' }]}
            >
              <Input prefix={<UserOutlined />} readOnly={!editMode} />
            </Form.Item>

            <Form.Item
              label="Profile Photo"
              name="profilePhoto"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload
                name="profilePhoto"
                beforeUpload={beforeUpload}
                listType="picture"
                maxCount={1}
                accept="image/jpeg,image/png"
              >
                <Button icon={<UploadOutlined />}>Upload Photo</Button>
              </Upload>
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              {editMode ? (
                <Button type="primary" onClick={onFinish} htmlType="submit" loading={loading}>
                  Done
                </Button>
              ) : (
                <Button type="primary" onClick={() => setEditMode(true)}>
                  Edit
                </Button>
              )}
            </Form.Item>
          </StyledForm>

          <ListSection>
            <h2>My Posts</h2>
            <List
              itemLayout="horizontal"
              dataSource={posts}
              renderItem={(post) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={post.title}
                    description={post.content}
                  />
                </List.Item>
              )}
            />
          </ListSection>
        </StyledContent>
      </Layout>
    </Container>
  );
};

export default MyProfilePage;
