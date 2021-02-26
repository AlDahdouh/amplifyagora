import React from "react";
import NewMarket from "../components/NewMarket";
import MarketList from "../components/MarketList";
import { API, graphqlOperation } from "aws-amplify";
import { listMarkets as searchMarkets } from "../graphql/queries";

class HomePage extends React.Component {
  state = { searchTerm: "", searchResults: [], isSearching: false };

  handleSearchChange = (searchTerm) => this.setState({ searchTerm });
  handleClearSearch = () =>
    this.setState({ searchTerm: "", searchResults: [] });

  handleSearch = async (e) => {
    try {
      e.preventDefault();
      this.setState({ isSearching: true });
      const result = await API.graphql(
        graphqlOperation(searchMarkets, {
          filter: {
            or: [
              { name: { contains: this.state.searchTerm } },
              { owner: { contains: this.state.searchTerm } },
              { tags: { contains: this.state.searchTerm } },
            ],
          },
          sort: {
            field: "createdAt",
            direction: "desc",
          },
        })
      );
      //console.log("result of search: ", result);
      this.setState({
        searchResults: result.data.listMarkets.items,
        isSearching: false,
      });
    } catch (err) {
      console.error(err);
    }

    //console.log(this.state.searchTerm);
  };

  render() {
    return (
      <>
        <NewMarket
          searchTerm={this.state.searchTerm}
          isSearching={this.state.isSearching}
          handleClearSearch={this.handleClearSearch}
          handleSearchChange={this.handleSearchChange}
          handleSearch={this.handleSearch}
        />
        <MarketList searchResults={this.state.searchResults} />
      </>
    );
  }
}

export default HomePage;
