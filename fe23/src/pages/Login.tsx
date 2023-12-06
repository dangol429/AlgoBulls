// Login.tsx

import React from 'react';
import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import Logo from '../images/logo.webp';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../redux/actions/authAction';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { useSelector } from 'react-redux';


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
  background-color: #f6f6f6;
  border-radius: 8px;
  text-align: center;
  width: 30%;
  margin-bottom: 10rem;
`;

const Heading = styled.h2`
  font-size: 50px;
`;

const Image = styled.img`
  max-width: 300px;
`;

const Login = () => {
  const [form] = Form.useForm();
  const { isAuthenticated } = useSelector((state: any) => state.auth.isAuthenticated);
  const navigate = useNavigate();

  const dispatch = useDispatch<ThunkDispatch<any, any, any>>(); // Use ThunkDispatch
  
  const onFinish = async (values: any) => {
    try{
      console.log("state: " + isAuthenticated);
      await dispatch(loginUser(values.email, values.password));
      form.resetFields();
      toast.success('Login successful!');
      console.log('success');
      setTimeout(() => navigate('/dashboard'), 2000);
      console.log(isAuthenticated)
    }
    catch(error: any){
      console.log('error')
    }
  }

  const authenticator = () => {
    console.log('state: ' + isAuthenticated)

  };

  return (
    <Container>
      <TopContainer>
        <Image src={Logo} alt="" />
      </TopContainer>
      <BottomContainer>
        <Heading>Login</Heading>
        <Form form={form} name="login" onFinish={onFinish}>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email address!' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} type="password" placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Login
            </Button>
          </Form.Item>
          <Button type="link" onClick={() => navigate('/')}>
          Dont have an account? Signup!
        </Button>
        </Form>
      </BottomContainer>
      <ToastContainer />
      <button onClick={authenticator} >CLick</button>
    </Container>
    
  );
};

export default Login;
