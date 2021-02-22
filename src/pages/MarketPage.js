import React from "react";
import { Loading, Tabs, Icon, Notification } from "element-react";
import { API, graphqlOperation } from "aws-amplify";
import { getMarket } from "../graphql/queries";
import {
  onCreateProduct,
  onDeleteProduct,
  onUpdateProduct,
} from "../graphql/subscriptions";
import Error from "../components/Error";
import { Link } from "react-router-dom";
import Product from "../components/Product";
import NewProduct from "../components/NewProduct";
// const getMarket = /* GraphQL */ `
//   query GetMarket($id: ID!) {
//     getMarket(id: $id) {
//       id
//       name
//       products {
//         items {
//           id
//           description
//           price
//           shipped
//           owner
//           file {
//             key
//             bucket
//             region
//           }
//           createdAt
//           updatedAt
//         }
//         nextToken
//       }
//       tags
//       owner
//       createdAt
//       updatedAt
//     }
//   }
// `;

class MarketPage extends React.Component {
  state = {
    isLoading: true,
    market: null,
    isOwner: false,
    subscriptions: [],
  };
  componentDidMount() {
    this.getMarketProc();
    this.onCreateProductSub();
    this.onDeleteProductSub();
    this.onUpdateProductSub();
  }

  getMarketProc = async () => {
    try {
      const input = {
        id: this.props.marketId,
      };
      const result = await API.graphql(graphqlOperation(getMarket, input));
      //console.log(result);
      this.setState({ market: result.data.getMarket, isLoading: false }, () =>
        this.checkOwner()
      );
    } catch (err) {
      console.error("Error in loading market ", err);
      return <Error errors={err} />;
    }
  };

  onCreateProductSub = () => {
    try {
      // Add subscription to track if new items were added
      const createProductListener = API.graphql(
        graphqlOperation(onCreateProduct, {
          owner: this.props.user.attributes.sub,
        })
      ).subscribe({
        next: (productData) => {
          const createdProduct = productData.value.data.onCreateProduct;
          const prevProducts = this.state.market.products.items.filter(
            (product) => product.id !== createdProduct.id
          );
          const updatedProducts = [createdProduct, ...prevProducts];
          const market = { ...this.state.market };
          market.products.items = updatedProducts;
          this.setState({ market });
        },
      });
      this.setState({
        subscriptions: [...this.state.subscriptions, createProductListener],
      });
    } catch (err) {
      console.error("ERROR :: ", err);
      Notification({
        type: "error",
        title: "Error",
        message:
          "Can not update the product list automatically, please consider refershing the page periodically.",
      });
    }
  };

  onDeleteProductSub = () => {
    try {
      const deleteProductListener = API.graphql(
        graphqlOperation(onDeleteProduct, {
          owner: this.props.user.attributes.sub,
        })
      ).subscribe({
        next: (deletedData) => {
          const deletedProduct = deletedData.value.data.onDeleteProduct;
          const updatedProducts = this.state.market.products.items.filter(
            (item) => item.id !== deletedProduct.id
          );
          const market = { ...this.state.market };
          market.products.items = updatedProducts;
          this.setState({ market });
        },
      });
      this.setState({
        subscriptions: [...this.state.subscriptions, deleteProductListener],
      });
    } catch (err) {
      console.error("ERROR :: ", err);
      Notification({
        type: "error",
        title: "Error",
        message:
          "Can not update the product list automatically, please consider refershing the page periodically.",
      });
    }
  };

  onUpdateProductSub = () => {
    try {
      const updateProductListener = API.graphql(
        graphqlOperation(onUpdateProduct, {
          owner: this.props.user.attributes.sub,
        })
      ).subscribe({
        next: (updatedData) => {
          const updatedProduct = updatedData.value.data.onUpdateProduct;
          const index = this.state.market.products.items.findIndex(
            (item) => item.id === updatedProduct.id
          );
          const updatedProducts = [
            this.state.market.products.items.slice(0, index),
            updatedProduct,
            this.state.market.products.items.slice(index + 1),
          ];
          const market = { ...this.state.market };
          market.products.items = updatedProducts;
          this.setState({ market });
        },
      });
      this.setState({
        subscriptions: [...this.state.subscriptions, updateProductListener],
      });
    } catch (err) {
      console.error("ERROR :: ", err);
      Notification({
        type: "error",
        title: "Error",
        message:
          "Can not update the product list automatically, please consider refershing the page periodically.",
      });
    }
  };

  componentWillMount() {
    this.state.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }
  checkOwner = async () => {
    //const loginUser = await Auth.currentAuthenticatedUser();
    const loginUser = this.props.user;
    //console.log("loginUser = ", loginUser);
    if (loginUser.username === this.state.market.owner) {
      this.setState({ isOwner: true });
    } else {
      this.setState({ isOwner: false });
    }
  };
  render() {
    return this.state.isLoading ? (
      <Loading fullscreen={true} />
    ) : (
      <>
        <Link className="link" to="/">
          Back to Market List
        </Link>
        <span className="items-center pt-2">
          <h2 className="mb-mr">{this.state.market.name}</h2> -{" "}
          {this.state.market.owner}
        </span>
        <div className="items-center pt-2">
          <span style={{ color: "var(--lightSquidInk)", paddingBottom: "1em" }}>
            <Icon name="date" className="icon" />
            {this.state.market.createdAt}
          </span>
        </div>
        <Tabs type="border-card" value={this.state.isOwner ? "1" : "2"}>
          {this.state.isOwner && (
            <Tabs.Pane
              name="1"
              label={
                <>
                  <Icon name="plus" className="icon" />
                  Add Product
                </>
              }
            >
              <NewProduct marketId={this.state.market.id} />
            </Tabs.Pane>
          )}
          <Tabs.Pane
            name="2"
            label={
              <>
                <Icon name="menu" className="icon" />
                Products{" "}
                {this.state.market.products
                  ? this.state.market.products.items.length
                  : 0}
              </>
            }
          >
            <div className="product-list">
              {this.state.market.products.items.map((product) => (
                <Product key={product.id} product={product} />
              ))}
            </div>
          </Tabs.Pane>
        </Tabs>
      </>
    );
  }
}

export default MarketPage;
