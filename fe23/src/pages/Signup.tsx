
import React from 'react';
import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import Logo from '../images/logo.webp';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { firestore } from '../firebase'; // Adjust the path accordingly
import { createUser } from '../redux/actions/authAction'; // Import createUser from authActions
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

const Container = styled.div`
  height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 0px;
`;

const TopContainer = styled.div`
  flex: 1;
  text-align: center;
  margin-top: 10rem;
`;

const BottomContainer = styled.div`
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  text-align: center;
  background-color: #f6f6f6;
  width: 30%;
  margin-bottom: 10rem;
`;

const Heading = styled.h2`
  font-size: 50px;
`;

const Image = styled.img`
  max-width: 300px;
`;

const Signup = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const dispatch = useDispatch<ThunkDispatch<any, any, any>>(); // Use ThunkDispatch

  const onFinish = async (values: any) => {
    try {
      // Dispatch the createUser action with the provided values
      await dispatch(createUser(firestore, values));

      form.resetFields();
      toast.success('Signup successful!');
      console.log('success');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Signup failed. Please try again.');
    } 
  };

  const validateConfirmPassword = ({ getFieldValue }: any) => ({
    validator(_: any, value: any) {
      if (!value || getFieldValue('password') === value) {
        return Promise.resolve();
      } else {
        return Promise.reject('The passwords do not match');
      }
    },
  });


  return (
    <Container>
      <TopContainer>
        <Image src={Logo} alt="" />
      </TopContainer>
      <BottomContainer>
        <Heading>Sign Up</Heading>
        <Form form={form} name="signup" onFinish={onFinish}>
          <Form.Item
            name="first_name"
            rules={[{ required: true, message: 'Please input your full name!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Full Name" />
          </Form.Item>

          <Form.Item
            name="last_name"
            rules={[{ required: true, message: 'Please input your last name!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Last Name" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email address!' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} type="password" placeholder="Password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              validateConfirmPassword,
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              type="password"
              placeholder="Confirm Password"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Sign Up
            </Button>
          </Form.Item>
          <Button type="link" onClick={() => navigate('/login')}>
          Already have an account? Login
        </Button>
        </Form>
      </BottomContainer>
      <ToastContainer />
    </Container>
  );
};

export default Signup;
