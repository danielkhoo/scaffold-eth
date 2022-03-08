import React from "react";
import { Modal } from "antd";
const TransactionDetailsModal = function ({ visible, handleOk, mainnetProvider, price, txnInfo = null }) {
  return (
    <Modal
      title="Transaction Details"
      visible={visible}
      onCancel={handleOk}
      destroyOnClose
      onOk={handleOk}
      footer={null}
      closable
      maskClosable
    >
      {txnInfo && (
        <div>
          <p>
            <b>Function Signature:</b> {txnInfo.functionSignature}()
          </p>
          <b>Arguments:</b>
          {txnInfo.functionArgs.map(element => {
            return (
              <div
                key={element}
                style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "left" }}
              >
                {element}
              </div>
            );
          })}
          <br />
          <b>TxnHash:</b>
          <br />
          {txnInfo.hash}
        </div>
      )}
    </Modal>
  );
};

export default TransactionDetailsModal;
