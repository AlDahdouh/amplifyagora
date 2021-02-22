import React from "react";
import { PhotoPicker } from "aws-amplify-react";
import { Storage, Auth, API, graphqlOperation } from "aws-amplify";
import aws_exports from "../aws-exports";
// prettier-ignore
import { Form, Button, Input, Notification, Radio, Progress } from "element-react";
import { createProduct } from "../graphql/mutations";
import { FromDollarToCent } from "../utils/index";

const initialState = {
  description: "",
  price: "",
  shipped: false,
  imagePreview: "",
  image: "",
  isUploading: false,
};
class NewProduct extends React.Component {
  state = {
    ...initialState,
  };

  handleAddProduct = async (e) => {
    e.preventDefault();
    console.log("Product Added ", this.state);
    try {
      this.setState({ isUploading: true });
      const visiablity = "public";
      const { identityId } = await Auth.currentCredentials();
      const filename = `/${visiablity}/${identityId}/${Date.now()}-${
        this.state.image.name
      }`;

      const uploadedFile = await Storage.put(filename, this.state.image.file, {
        contentType: this.state.image.type,
      });

      const file = {
        key: uploadedFile.key,
        bucket: aws_exports.aws_user_files_s3_bucket,
        region: aws_exports.aws_user_files_s3_bucket_region,
      };
      const input = {
        description: this.state.description,
        price: FromDollarToCent(this.state.price),
        shipped: this.state.shipped,
        productMarketId: this.props.marketId,
        file,
      };
      const result = await API.graphql(
        graphqlOperation(createProduct, { input })
      );
      console.log("Result :: ", result.data.createProduct);
      Notification({
        title: "Success",
        message: "Product successfully created!",
        type: "success",
      });
      this.setState({ ...initialState });
    } catch (err) {
      console.error(err.message);
      Notification.error(err.message);
    }
  };

  render() {
    return (
      <div className="flex-center">
        <h2 className="header">Add New Product</h2>
        <div>
          <Form className="market-header">
            <Form.Item label="Add Product Description">
              <Input
                type="text"
                icon="information"
                placeholder="Description"
                onChange={(description) => this.setState({ description })}
                value={this.state.description}
              />
            </Form.Item>
            <Form.Item label="Set Product Price">
              <Input
                type="number"
                icon="plus"
                placeholder="Price ($USD)"
                onChange={(price) => this.setState({ price })}
                value={this.state.price}
              />
            </Form.Item>
            <Form.Item label="Is the product shipped or emailed to the customer?">
              <div className="text-center">
                <Radio
                  value={"true"}
                  checked={this.state.shipped === "true"}
                  onChange={() => this.setState({ shipped: true })}
                >
                  Shipped
                </Radio>
                <Radio
                  value={"false"}
                  checked={this.state.shipped === "false"}
                  onChange={() => this.setState({ shipped: false })}
                >
                  Emailed
                </Radio>
              </div>
            </Form.Item>
            {this.state.imagePreview && (
              <img
                className="image-preview"
                src={this.state.imagePreview}
                alt="Product Preview"
              />
            )}
            <PhotoPicker
              preview="hidden"
              onLoad={(imagePreview) => this.setState({ imagePreview })}
              onPick={(file) => this.setState({ image: file })}
              theme={{
                formContainer: {
                  margin: 0,
                  padding: "0.8em",
                },
                formSection: {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                },
                sectionBody: {
                  margin: 0,
                  width: "250px",
                },
                sectionHeader: {
                  padding: "0.2em",
                  color: "var(--darkAmazonOrange)",
                },
                photoPickerButton: {
                  display: "none",
                },
              }}
            />
            <Form.Item>
              <Button
                type="primary"
                disabled={
                  !this.state.image ||
                  !this.state.description ||
                  !this.state.price ||
                  this.state.isUploading
                }
                loading={this.state.isUploading}
                onClick={this.handleAddProduct}
              >
                {this.state.isUploading ? "Uploading..." : "Add Product"}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    );
  }
}

export default NewProduct;
