import React, { useState, useEffect } from 'react';
import { Layout, Menu, Dropdown, Button, Modal } from 'antd';
import {
  HomeOutlined,
  LikeOutlined,
  BookOutlined,
  FormOutlined,
  UserOutlined,
  LogoutOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Facebook from '../images/logo.webp';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { logoutUser } from '../redux/actions/authAction';
import { useSelector } from 'react-redux'
import useCurrentUser from '../firebase/currentUser'


const { Sider } = Layout;

const SidebarWrapper = styled(Sider)`
  width: 300px;
  height: 20vh;
`;

const MenuWrapper = styled(Menu)`
  height: 100%;
  position: fixed;
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const StyledLink = styled(Link)`
  margin-bottom: 200px;
`;

const SidebarComponent = styled.div`
  position: relative
`;

const Logo = styled.img`
  margin-top: 41rem;
  width: 10rem;
  position: absolute;
  left: 50%;
  transform: translate(-50%);
`;

const Sidebar = () => {
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>(); // Use ThunkDispatch
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);
  const CurrentUser = useSelector((state: any) => state.auth.user);

  const showLogoutConfirmation = () => {
    setLogoutModalVisible(true);
  };

  const handleLogout = async () => {
    console.log(isAuthenticated)
    try{
      await dispatch(logoutUser())
      console.log('User logged out');
      toast.success('Logged Out Successfully!');
      setLogoutModalVisible(false);
      setTimeout(() => navigate('/login'), 2000);
    }
    catch(error: any){
      console.log("error while loggin out.")
    }
  };

  const handleCancelLogout = () => {
    setLogoutModalVisible(false);
  };

  return (
    <>
    <SidebarComponent>
      <SidebarWrapper theme="dark" width={260}>
        <MenuWrapper mode="vertical" theme="light" defaultSelectedKeys={['1']}>
          <Menu.Item key="1" icon={<HomeOutlined />}>
            <StyledLink to="/dashboard">Home</StyledLink>
          </Menu.Item>
          <Menu.Item key="2" icon={<LikeOutlined />}>
            <StyledLink to="/my-likes">My Likes</StyledLink>
          </Menu.Item>
          <Menu.Item key="3" icon={<BookOutlined />}>
            <StyledLink to="/my-bookmarks">My Bookmarks</StyledLink>
          </Menu.Item>
          <Menu.Item key="4" icon={<FormOutlined />}>
            <StyledLink to="/my-posts">My Posts</StyledLink>
          </Menu.Item>
          <Menu.Item key="5" icon={<UserOutlined />}>
            <StyledLink to="/my-profile">My Profile</StyledLink>
          </Menu.Item>
          <Menu.Item key="logout" onClick={showLogoutConfirmation}>
            <LogoutOutlined /> Logout
          </Menu.Item>
          <Logo src={Facebook} alt="" />
        </MenuWrapper>
      </SidebarWrapper>
      <Modal
        title="Logout Confirmation"
        open={logoutModalVisible}
        onOk={handleLogout}
        onCancel={handleCancelLogout}
        okText="Yes"
        cancelText="No"
      >
        <p>Are you sure you want to logout?</p>
      </Modal>
    </SidebarComponent>
    <ToastContainer />
    </>
  );
};

export default Sidebar;
