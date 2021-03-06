import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Form,
  Input,
  Button,
  DatePicker,
  Row,
  Col,
  Upload,
  Modal,
  message
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';

// Components
import CallingCodeFormItem from '../CallingCodeFormItem/CallingCodeFormItem';

// Actions
import { register } from '../../actions/UserActions';

// Constants
import { LOGIN_URL, DATE_FORMAT } from '../../constants/GlobalConstants';

// Utils
import { getBase64, getErrorMessage, b64toBlob } from '../../utils/helpers';

// Styles
import './Register.scss';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};

const validateMessages = {
  // eslint-disable-next-line no-template-curly-in-string
  required: '${label} is required!',
  types: {
    // eslint-disable-next-line no-template-curly-in-string
    email: '${label} is invalid formatted!'
  }
};

const propTypes = {
  register: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired
};

const defaultProps = {};

const Register = ({ history }) => {
  const [loading, setLoading] = useState(false);
  //upload state
  const [uploadState, setUploadState] = useState({
    previewVisible: false,
    previewImage: '',
    previewTitle: '',
    fileList: []
  });

  const handleImageCancel = () => {
    setUploadState(prevState => ({ ...prevState, previewVisible: false }));
  };

  const handleImagePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    setUploadState(prevState => ({
      ...prevState,
      previewImage: file.url || file.preview,
      previewVisible: true,
      previewTitle:
        file.name || file.url.substring(file.url.lastIndexOf('/') + 1)
    }));
  };

  const handleImagesChange = ({ fileList }) => {
    setUploadState(prevState => ({ ...prevState, fileList }));
  };

  const onFinish = async values => {
    try {
      setLoading(true);

      const {
        username,
        email,
        password,
        name,
        DoB,
        callingCode,
        phone,
        address,
        identityNumber,
        registrationDate
      } = values;

      const body = {
        username,
        email,
        password,
        name,
        dateOfBirth: DoB.format(DATE_FORMAT),
        phoneNumber: callingCode + phone,
        address,
        identityNumber,
        registrationDate: registrationDate.format(DATE_FORMAT)
      };

      //parse body to formData
      const formData = new FormData();
      for (const key in body) {
        formData.append(key, body[key]);
      }

      //parse base64 to blob
      const { fileList } = uploadState;
      const propsName = ['frontImage', 'backImage'];
      for (let i = 0; i < fileList.length; i++) {
        const block = fileList[i].thumbUrl.split(';');
        // Get the content type of the image
        const contentType = block[0].split(':')[1]; // In this case "image/jpeg..."
        // get the real base64 content of the file
        const realData = block[1].split(',')[1]; // In this case "R0lGODlhPQBEAPeoAJosM...."
        // Convert it to a blob to upload
        const blob = b64toBlob(realData, contentType);

        formData.append(propsName[i], blob);
      }

      await register(formData);

      message.success('New account is created');
      history.push(LOGIN_URL);
    } catch (err) {
      message.error(getErrorMessage(err), 10);
      setLoading(false);
    }
  };

  const { previewVisible, previewImage, fileList, previewTitle } = uploadState;
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div className="ant-upload-text">Upload</div>
    </div>
  );

  return (
    <div className="public-form">
      <div className="public-form__wrap">
        <h2 className="public-form__header">Register new account</h2>
        <Form
          {...layout}
          name="form"
          onFinish={onFinish}
          validateMessages={validateMessages}
          initialValues={{ callingCode: '+84' }}
        >
          <Row gutter={8}>
            <Col xl={12} lg={12} md={24} sm={24} xs={24}>
              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, type: 'email' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true }]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm password"
                dependencies={['password']}
                rules={[
                  { required: true },
                  ({ getFieldValue }) => ({
                    validator(rule, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        'Password and password confirmation are not the same!'
                      );
                    }
                  })
                ]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item
                name="name"
                label="Fullname"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="DoB"
                label="Birthday"
                rules={[{ required: true }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD-MM-yyyy"
                  placeholder=""
                />
              </Form.Item>

              <Form.Item
                label="Phone"
                rules={[{ required: true }]}
                style={{ marginBottom: '0' }}
              >
                <Row gutter={4}>
                  <Col span={8}>
                    <CallingCodeFormItem />
                  </Col>
                  <Col span={16}>
                    <Form.Item
                      name="phone"
                      rules={[{ required: true, message: 'Phone is required' }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
              </Form.Item>

              <Form.Item
                name="address"
                label="Address"
                rules={[{ required: true }]}
              >
                <Input.TextArea />
              </Form.Item>
            </Col>

            <Col xl={12} lg={12} md={24} sm={24} xs={24}>
              <Form.Item
                name="identityNumber"
                label="Identification ID No"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="registrationDate"
                label="Issued on"
                rules={[{ required: true }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format={DATE_FORMAT}
                  placeholder=""
                />
              </Form.Item>

              <Form.Item
                name="photos"
                label="Identification Card photo"
                rules={[
                  () => ({
                    validator(_, value) {
                      if (fileList.length !== 2) {
                        return Promise.reject(
                          'There must be at least 2 photos'
                        );
                      }

                      const fileSplit = value ? value.split('.') : [];
                      if (fileSplit.length > 0) {
                        const ext = fileSplit[fileSplit.length - 1];
                        if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          'There must be in correct format (jpg, jpeg, png)'
                        );
                      }
                    }
                  })
                ]}
              >
                <div className="clearfix">
                  <Upload
                    listType="picture-card"
                    fileList={fileList}
                    onPreview={handleImagePreview}
                    onChange={handleImagesChange}
                    beforeUpload={() => false}
                  >
                    {fileList.length === 2 ? null : uploadButton}
                  </Upload>

                  <Modal
                    visible={previewVisible}
                    title={previewTitle}
                    footer={null}
                    onCancel={handleImageCancel}
                  >
                    <img
                      alt="photos"
                      style={{ width: '100%' }}
                      src={previewImage}
                    />
                  </Modal>
                </div>
              </Form.Item>
            </Col>
          </Row>

          <Row align="middle" justify="center">
            <Col span={24}>
              <Form.Item wrapperCol={{ offset: 10 }}>
                <Button loading={loading} type="primary" htmlType="submit">
                  Register
                </Button>

                <a href={LOGIN_URL} style={{ marginLeft: '10px' }}>
                  Back
                </a>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
};

Register.propTypes = propTypes;
Register.defaultProps = defaultProps;

export default Register;
