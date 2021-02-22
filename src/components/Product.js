import React from "react";
// prettier-ignore
import { Notification, Popover, Button, Dialog, Card, Form, Input, Radio, Icon } from "element-react";
import { S3Image } from "aws-amplify-react";
import { FromCentToDollar, FromDollarToCent } from "../utils/index";
import { UserContext } from "../App";
import PayButton from "../components/PayButton";
import { API, graphqlOperation } from "aws-amplify";
import { updateProduct, deleteProduct } from "../graphql/mutations";

class Product extends React.Component {
  state = {
    updateProductDialog: false,
    description: "",
    price: "",
    shipped: false,
    deleteProductDialog: false,
  };
  handleUpdateProduct = async (productId) => {
    try {
      this.setState({ updateProductDialog: false });
      const input = {
        id: productId,
        description: this.state.description,
        price: FromDollarToCent(this.state.price),
        shipped: this.state.shipped,
      };
      const result = await API.graphql(
        graphqlOperation(updateProduct, { input })
      );
      console.log(result);
      Notification({
        title: "Success",
        message: "Product updated Sccessfully",
        type: "success",
      });
    } catch (err) {
      console.error("Error: ", err.message);
      Notification({
        title: "Error",
        message: "Error in updating product",
        type: "error",
      });
    }
  };

  handleDeleteProduct = async (productId) => {
    try {
      const input = {
        id: productId,
      };
      await API.graphql(graphqlOperation(deleteProduct, { input }));
      Notification({
        type: "success",
        title: "Success",
        message: "Product deleted successfully!",
      });
    } catch (err) {
      console.error("Error: ", err);
      Notification({
        type: "error",
        title: "Error",
        message: `Error in deleting the this product. Details:${err.message}`,
      });
    }
  };
  render() {
    return (
      <UserContext.Consumer>
        {({ user }) => {
          const isProductOwner =
            user && user.attributes.sub === this.props.product.owner;
          //console.log("this.props.product = ", this.props.product);
          return (
            <div className="card-container">
              <Card bodyStyle={{ padding: 0, minWidth: "200px" }}>
                <S3Image
                  imgKey={this.props.product.file.key}
                  theme={{ photoImg: { maxWidth: "100%", maxHeight: "100%" } }}
                />
                <div className="card-body">
                  <h3 className="m-0">{this.props.product.description}</h3>
                  <div className="items-center">
                    <Icon name="email" />{" "}
                    {this.props.product.shipped ? "Shipped" : "Emailed"}
                  </div>
                  <div className="text-right">
                    <span className="mx-1">
                      ${FromCentToDollar(this.props.product.price)}
                    </span>
                    {!isProductOwner && (
                      <PayButton product={this.props.product} user={user} />
                    )}
                  </div>
                </div>
                <div className="">
                  {isProductOwner && (
                    <>
                      <Button
                        className="m-1"
                        type="warning"
                        icon="edit"
                        onClick={() =>
                          this.setState({
                            updateProductDialog: true,
                            description: this.props.product.description,
                            shipped: this.props.product.shipped,
                            price: FromCentToDollar(this.props.product.price),
                          })
                        }
                      />
                      <Popover
                        title="Delete Product"
                        width="160"
                        placement="top"
                        trigger="click"
                        visible={this.state.deleteProductDialog}
                        content={
                          <>
                            <p>Do you want to delete this product?</p>
                            <div className="text-right">
                              <Button
                                size="mini"
                                type="text"
                                className="m-1"
                                onClick={() =>
                                  this.setState({
                                    deleteProductDialog: false,
                                  })
                                }
                              >
                                Cancel
                              </Button>
                              <Button
                                size="mini"
                                type="primary"
                                className="m-1"
                                onClick={() =>
                                  this.handleDeleteProduct(
                                    this.props.product.id
                                  )
                                }
                              >
                                {" "}
                                Confirm
                              </Button>
                            </div>
                          </>
                        }
                      >
                        <Button
                          onClick={() =>
                            this.setState({ deleteProductDialog: true })
                          }
                          type="danger"
                          icon="delete"
                        />
                      </Popover>
                    </>
                  )}
                </div>
              </Card>
              <Dialog
                title="Update Product"
                size="large"
                customClass="dialog"
                visible={this.state.updateProductDialog}
                onCancel={() => this.setState({ updateProductDialog: false })}
              >
                <Dialog.Body>
                  <Form labelPosition="top">
                    <Form.Item label="Update Description">
                      <Input
                        type="information"
                        placeholder="Description"
                        trim={true}
                        onChange={(description) =>
                          this.setState({ description })
                        }
                        value={this.state.description}
                      />
                    </Form.Item>
                    <Form.Item label="Update Product Price">
                      <Input
                        type="number"
                        icon="plus"
                        placeholder="Price ($USD)"
                        onChange={(price) => this.setState({ price })}
                        value={this.state.price}
                      />
                    </Form.Item>
                    <Form.Item label="Update shipping">
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
                  </Form>
                </Dialog.Body>
                <Dialog.Footer>
                  <Button
                    onClick={() =>
                      this.setState({ updateProductDialog: false })
                    }
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    onClick={() =>
                      this.handleUpdateProduct(this.props.product.id)
                    }
                  >
                    Update
                  </Button>
                </Dialog.Footer>
              </Dialog>
            </div>
          );
        }}
      </UserContext.Consumer>
    );
  }
}

export default Product;
