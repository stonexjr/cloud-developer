import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import {getUploadUrl, patchTxn, uploadFile} from '../api/txns-api'
import update from "immutability-helper";
import {UpdateTxnRequest} from "../types/UpdateTxnRequest";

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditTxnProps {
  match: {
    params: {
      txnId: string,
      name: string,
      type: string,
      amount: number
    }
  }
  auth: Auth
}

interface EditTxnState {
  file: any
  name: string
  type: string
  amount: number
  uploadState: UploadState
}

export class EditTxn extends React.PureComponent<
  EditTxnProps,
  EditTxnState
> {
  state: EditTxnState = {
    file: undefined,
    name: "unknown",
    type: "grocery",
    amount: 0,
    uploadState: UploadState.NoUpload
  };

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    this.setState({
      file: files[0]
    })
  };

  handleTxnNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;
    if (!name || name.length < 1) {alert("invalid txn name string"); return;}

    this.setState({
      name: name
    })
  };

  handleTxnTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const type = event.target.value;
    if (!type || type.length < 1) {alert("invalid type string"); return;}

    this.setState({
      type: type
    })
  };

  handleTxnAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const amount = event.target.valueAsNumber;
    if (amount < 0) {alert("amount must be positive"); return;}

    this.setState({
      amount: amount
    })
  };

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    try {
      if (!this.state.file) {
        alert('File should be selected');
        return
      }

      this.setUploadState(UploadState.FetchingPresignedUrl);
      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.txnId);

      this.setUploadState(UploadState.UploadingFile);
      console.log('uploadUrl:');
      console.log(uploadUrl);
      await uploadFile(uploadUrl, this.state.file);
      await this.updateTxn({
        name: this.state.name,
        type: this.state.type,
        amount: this.state.amount
      });

      alert('File was uploaded!')
    } catch (e) {
      alert('Could not upload a file: ' + e.message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  };

  updateTxn = async (updatedTxn: UpdateTxnRequest) => {
    try {
      // const txn = this.state.txns[pos];
      const params = this.props.match.params;
      await patchTxn(this.props.auth.getIdToken(), params.txnId, updatedTxn);

      // this.setState({
      //   txns: update(this.state.txns, {
      //     [pos]: { amount: { $set: txn.amount }, type: { $set: txn.type} }
      //   })
      // })
    } catch {
      alert('Txn update failed')
    }
  };

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  };

  render() {
    return (
      <div>
        <h1>Update transaction</h1>

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>File</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
            <label>Name</label>
            <input
              type="text"
              placeholder={this.props.match.params.name}
              onChange={this.handleTxnNameChange}
            />
            <label>Type</label>
            <input
              type="text"
              placeholder={this.props.match.params.type}
              onChange={this.handleTxnTypeChange}
            />
            <label>Amount</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder={this.props.match.params.amount + ""}
              onChange={this.handleTxnAmountChange}
            />
          </Form.Field>

          {this.renderButton()}
        </Form>
      </div>
    )
  }

  renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Update
        </Button>
      </div>
    )
  }
}
