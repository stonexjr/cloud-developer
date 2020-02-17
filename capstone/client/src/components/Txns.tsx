import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createTxn, deleteTxn, getTxns, patchTxn } from '../api/txns-api'
import Auth from '../auth/Auth'
import { Txn } from '../types/Txn'

interface TxnsProps {
  auth: Auth
  history: History
}

interface TxnsState {
  txns: Txn[]
  newTxnName: string
  loadingTxns: boolean
}

export class Txns extends React.PureComponent<TxnsProps, TxnsState> {
  state: TxnsState = {
    txns: [],
    newTxnName: '',
    loadingTxns: true
  };

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTxnName: event.target.value })
  };

  onEditButtonClick = (txnId: string, name: string, type: string, amount: number) => {
    this.props.history.push(`/txns/${txnId}/name/${name}/type/${type}/amount/${amount}/edit`)
  };

  onTxnCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    if(!this.state.newTxnName || this.state.newTxnName.length < 1){
      alert('Task name is empty!');
      return;
    }
    try {
      const newTxn = await createTxn(this.props.auth.getIdToken(), {
        name: this.state.newTxnName,
        type: 'unknown',
        amount: 0
      });

      this.setState({
        txns: [...this.state.txns, newTxn],
        newTxnName: ''
      })
    } catch {
      alert('Txn creation failed')
    }
  };

  onTxnDelete = async (txnId: string) => {
    try {
      await deleteTxn(this.props.auth.getIdToken(), txnId);
      this.setState({
        txns: this.state.txns.filter(txn => txn.txnId != txnId)
      })
    } catch {
      alert('Txn deletion failed')
    }
  };

  // onTxnCheck = async (pos: number) => {
  //   try {
  //     const txn = this.state.txns[pos];
  //     await patchTxn(this.props.auth.getIdToken(), txn.txnId, {
  //       name: txn.name,
  //       type: txn.type,
  //       amount: txn.amount
  //     });
  //
  //     this.setState({
  //       txns: update(this.state.txns, {
  //         [pos]: { amount: { $set: txn.amount }, type: { $set: txn.type} }
  //       })
  //     })
  //   } catch {
  //     alert('Txn update failed')
  //   }
  // };

  async componentDidMount() {
    try {
      const txns = await getTxns(this.props.auth.getIdToken());
      this.setState({
        txns: txns,
        loadingTxns: false
      })
    } catch (e) {
      alert(`Failed to fetch txns: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Transactions</Header>

        {this.renderCreateTxnInput()}

        {this.renderTxns()}
      </div>
    )
  }

  renderCreateTxnInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New transaction',
              onClick: this.onTxnCreate
            }}
            fluid
            actionPosition="left"
            placeholder="Purchase at Costco..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderTxns() {
    if (this.state.loadingTxns) {
      return this.renderLoading()
    }

    return this.renderTxnsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Transactions
        </Loader>
      </Grid.Row>
    )
  }

  renderTxnsList() {
    return (
      <Grid padded>
        <Grid.Row key={0}>
          <Grid.Column width={8} verticalAlign="middle">
            {"txn name"}
          </Grid.Column>
          <Grid.Column width={3} floated="right">
            {"txn type"}
          </Grid.Column>
          <Grid.Column width={3} floated="right">
            {"txn amount ($)"}
          </Grid.Column>
          <Grid.Column width={2} floated="right">
            {"Edit"}
          </Grid.Column>
          <Grid.Column width={16}>
            <Divider />
          </Grid.Column>
        </Grid.Row>

        {this.state.txns.map((txn, pos) => {
          return (
            <Grid.Row key={txn.txnId}>
              <Grid.Column width={8} verticalAlign="middle">
                {txn.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {txn.type}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {txn.amount}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(txn.txnId,txn.name,txn.type,txn.amount)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onTxnDelete(txn.txnId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {txn.attachmentUrl && (
                <Image src={txn.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 7);

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
