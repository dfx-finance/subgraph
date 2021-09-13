# graph

## To setup and deploy

1. Go to `https://thegraph.com/studio/`
2. Connect your metamask wallet
3. Create a subgraph called 'testgraph'
4. Go to your command line. `npm install -g @graphprotocol/graph-cli`
5. Clone this repo
6. `cd graph`
7. Generate the code from the schema `graph codegen`
8. Copy the Deploy Key from `https://thegraph.com/studio/` under 'testgraph'
9. In your command line, `graph auth --studio`
10. Paste your Deploy Key when prompted
11. Deploy to your instance `graph deploy --studio testgraph`
12. Set version to '0.1' and increment as you update the schema
13. Go back to `https://thegraph.com/studio/` and you can start querying once it has synced to 100%
14. Run this query to get the latest trades ordered from newest to oldest

```
{
  trades(
    orderBy: createdAtTimestamp
    orderDirection: desc
  ) {
    id
    createdAtTimestamp
    trader
    origin
    target
    originAmount
    targetAmount
  }
}

```
