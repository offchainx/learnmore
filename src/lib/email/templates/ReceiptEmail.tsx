import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface ReceiptEmailProps {
  username?: string;
  orderId?: string;
  amount?: string;
  planName?: string;
  date?: string;
  invoiceUrl?: string;
}

export const ReceiptEmail = ({
  username = '同学',
  orderId = 'ORD-123456',
  amount = 'RM 99.00',
  planName = 'Smart Plus 订阅',
  date = new Date().toLocaleDateString(),
  invoiceUrl,
}: ReceiptEmailProps) => (
  <Html>
    <Head />
    <Preview>感谢你的订阅！这是你的支付收据。</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={heading}>支付成功</Heading>
        </Section>
        <Section style={content}>
          <Text style={paragraph}>你好，{username}！</Text>
          <Text style={paragraph}>
            感谢你对 LearnMore 的支持。你的订阅已成功激活，以下是订单详情：
          </Text>
          <Section style={infoBox}>
            <Text style={infoText}><strong>订单号：</strong> {orderId}</Text>
            <Text style={infoText}><strong>订阅计划：</strong> {planName}</Text>
            <Text style={infoText}><strong>支付金额：</strong> {amount}</Text>
            <Text style={infoText}><strong>日期：</strong> {date}</Text>
          </Section>
          <Text style={paragraph}>
            你可以前往个人中心管理你的订阅。
          </Text>
          {invoiceUrl && (
            <Section style={buttonContainer}>
              <Link style={button} href={invoiceUrl}>
                查看发票
              </Link>
            </Section>
          )}
          <Hr style={hr} />
          <Text style={footer}>
            此邮件作为你的支付凭证，请妥善保管。<br />
            © 2026 LearnMore. All rights reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default ReceiptEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const header = {
  padding: '32px',
  textAlign: 'center' as const,
  backgroundColor: '#f9fafb',
};

const heading = {
  color: '#10b981',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
};

const content = {
  padding: '0 32px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#484848',
};

const infoBox = {
  backgroundColor: '#f3f4f6',
  padding: '20px',
  borderRadius: '8px',
  margin: '24px 0',
};

const infoText = {
  fontSize: '14px',
  margin: '8px 0',
  color: '#374151',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const button = {
  backgroundColor: '#10b981',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  width: '180px',
  padding: '12px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
};
