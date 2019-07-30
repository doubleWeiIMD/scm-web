import { Upload, Icon, Modal,message } from 'antd';
import {onGetImageUrl} from '@/utils/FunctionSet';

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

//主表图片格式的上传
export default class ImageUpload extends React.Component {
  state = {
    previewVisible: false,
    previewImage: '',
    fileList: this.props.field.FIELD_VALUE,
  };

  componentWillReceiveProps = (newProps) => {
    const { fileList } = this.state
    if (!newProps.field.FIELD_VALUE) {
      this.setState({ fileList: [] })
    } else {
      this.setState({ fileList: newProps.field.FIELD_VALUE })
    }
  }

  handleCancel = () => this.setState({ previewVisible: false });

  handlePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    let url = onGetImageUrl(file)
    this.setState({
      // previewImage: file.url || file.preview,
      previewImage: url,
      previewVisible: true,
    });
  };

  beforeUpload=(file)=> {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png' || file.type === 'image/png' || file.type === 'image/icon';
    if (!isJpgOrPng) {
      message.error('只能上传图片格式文件!');
    }
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('上传的图片大小必须小于10M!');
    }
    return isJpgOrPng && isLt10M;
  }  

  handleChange = ({ fileList, file }) => {
    let url = onGetImageUrl(file)
    fileList = fileList.slice(-1); //限制只保留一张图片
    // fileList[0].response.data.url = fileList[0].response.data ?  = url : 
    this.props.handleImageChange(fileList)
    this.props.dispatch({ type: 'tableTemplate/save', payload: { fileList, fileKey: this.props.field.FIELD_NAME } })
    this.setState({ 
      fileList,
      previewImage: url,
     });
  }

  render() {
    const { previewVisible, previewImage } = this.state;
    // const fileList  = this.props.field.FIELD_VALUE
    const { fileList } = this.state
    const { apiUrl: _apiUrl } = window.config;
    const origin = localStorage.getItem('origin') || '';
    const apiUrl = process.env.NODE_ENV === 'development' ? _apiUrl : origin;
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">选择图片</div>
      </div>
    );
    return (
      <div className="clearfix" style={{ cursor: this.props.disabled ? 'not-allowed' : '' }}>
        <Upload
          action={apiUrl + '/rs/uploadImage'}
          listType="picture-card"
          beforeUpload={this.beforeUpload}
          disabled={this.props.disabled}
          fileList={fileList}
          showUploadList={{ showPreviewIcon: this.props.disabled ? true : true, showRemoveIcon: this.props.disabled ? false : true }}
          headers={{ sessionId: localStorage.getItem('sessionId') || '' }}
          onPreview={this.handlePreview}
          onChange={this.handleChange}
        >
          {this.props.disabled ? '' : uploadButton}
        </Upload>
        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </div>
    );
  }
}