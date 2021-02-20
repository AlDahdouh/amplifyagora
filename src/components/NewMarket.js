import React from "react";
// prettier-ignore
import { Form, Button, Dialog, Input, Select, Notification } from 'element-react'
import { API, graphqlOperation } from "aws-amplify";
import { createMarket } from "../graphql/mutations";
import { UserContext } from "../App";

class NewMarket extends React.Component {
  state = {
    addMarketDialog: false,
    name: "",
    tags: ["Web Dev", "Technolgoy", "Arts", "Crafts", "Entertainment"],
    selectedTags: [],
    options: [],
  };
  handleAddMarket = async (user) => {
    this.setState({ addMarketDialog: false });
    try {
      const input = {
        name: this.state.name,
        owner: user.username,
        tags: this.state.selectedTags,
      };
      const result = await API.graphql(
        graphqlOperation(createMarket, { input })
      );
      console.info("Created market:", result.data.createMarket);
      this.setState({ name: "", selectedTags: [], options: [] });
    } catch (err) {
      console.error("Error adding market ", err);
      Notification.error(`${err.message || "Error adding market"}`);
    }
  };

  handleFilterTags = (query) => {
    const options = this.state.tags
      .map((tag) => ({ value: tag, label: tag }))
      .filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));
    this.setState({ options });
  };
  render() {
    return (
      <UserContext.Consumer>
        {({ user }) => (
          <>
            <div className="market-header">
              <h1 className="market-title">
                Create Your Market Place
                <Button
                  type="text"
                  icon="edit"
                  className="market-title-button"
                  onClick={() => {
                    this.setState({ addMarketDialog: true });
                  }}
                />
              </h1>
            </div>

            <Dialog
              title="Create New Market"
              visible={this.state.addMarketDialog}
              onCancel={() => this.setState({ addMarketDialog: false })}
              size="large"
              customClass="dialog"
            >
              <Dialog.Body>
                <Form labelPosition="top">
                  <Form.Item label="Add Market Name">
                    <Input
                      placeholder="Market Name"
                      trim={true}
                      onChange={(name) => this.setState({ name })}
                      value={this.state.name}
                    />
                  </Form.Item>
                  <Form.Item label="Tags">
                    <Select
                      filterable={true}
                      multiple={true}
                      placeholder="Add Tag"
                      onChange={(selectedTags) =>
                        this.setState({ selectedTags })
                      }
                      remote={true}
                      remoteMethod={this.handleFilterTags}
                    >
                      {this.state.options.map((option) => (
                        <Select.Option
                          key={option.value}
                          label={option.label}
                          value={option.value}
                        />
                      ))}
                    </Select>
                  </Form.Item>
                </Form>
              </Dialog.Body>
              <Dialog.Footer>
                <Button
                  onClick={() => this.setState({ addMarketDialog: false })}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  onClick={() => this.handleAddMarket(user)}
                  disabled={!this.state.name}
                >
                  Add
                </Button>
              </Dialog.Footer>
            </Dialog>
          </>
        )}
      </UserContext.Consumer>
    );
  }
}

export default NewMarket;
