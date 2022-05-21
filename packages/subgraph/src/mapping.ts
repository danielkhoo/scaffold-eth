import { BigInt, Address, log } from "@graphprotocol/graph-ts";
import {
  YourContract,
  RegisterCertificate,
  CertifyUser,
} from "../generated/YourContract/YourContract";
import { User, Certificate, Admin, CertificateTemplate } from "../generated/schema";



export function handleRegisterCertificate(event: RegisterCertificate): void {
  let senderString = event.params.sender.toHexString();
  let certHash = event.params.certHash.toHexString()

  let sender = Admin.load(senderString);
  if (sender === null) {
    sender = new Admin(senderString);
  }

  let template = new CertificateTemplate(certHash)
  template.admin = senderString;
  template.name = event.params.certName
  template.createdAt = event.block.timestamp;

  template.save();
  sender.save();
}

export function handleCertifyUser(event: CertifyUser): void {
  let userAddressString = event.params.userAddress.toHexString();
  let certHash = event.params.certHash.toHexString();

  let template = CertificateTemplate.load(certHash)
  if (template == null) return

  let user = User.load(userAddressString);
  if (user === null) {
    user = new User(userAddressString);
    user.createdAt = event.block.timestamp;
  }


  let certificate = new Certificate(event.transaction.hash.toHex())
  certificate.template = certHash
  certificate.user = userAddressString
  certificate.createdAt = event.block.timestamp;

  certificate.save();
  user.save();
}