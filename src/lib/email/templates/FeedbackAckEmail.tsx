import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface FeedbackAckEmailProps {
  username?: string;
  feedbackId?: string;
  category?: string;
  estimatedResponseTime?: string;
}

export const FeedbackAckEmail = ({
  username = '同学',
  feedbackId = 'FB-12345',
  category = '功能建议',
  estimatedResponseTime = '24-48 小时',
}: FeedbackAckEmailProps) => (
  <Html>
    <Head />
    <Preview>我们已收到你的反馈</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={heading}>反馈已确认</Heading>
        </Section>
        <Section style={content}>
          <Text style={paragraph}>你好，{username}！</Text>
          <Text style={paragraph}>
            感谢你对 LearnMore 的反馈。我们非常重视每一位用户的意见，这能帮助我们做得更好。
          </Text>
          <Section style={infoBox}>
            <Text style={infoText}><strong>反馈单号：</strong> {feedbackId}</Text>
            <Text style={infoText}><strong>反馈类别：</strong> {category}</Text>
            <Text style={infoText}><strong>预估处理时间：</strong> {estimatedResponseTime}</Text>
          </Section>
          <Text style={paragraph}>
            我们的团队会尽快审阅你的反馈。如果有任何进展，我们会通过站内通知或邮件告知你。
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            感谢你帮助我们改进！<br />
            © 2026 LearnMore. All rights reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default FeedbackAckEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
};

const header = {
  padding: '32px',
  textAlign: 'center' as const,
  backgroundColor: '#f0f9ff',
};

const heading = {
  color: '#0369a1',
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
  backgroundColor: '#f8fafc',
  padding: '16px',
  borderRadius: '8px',
  margin: '24px 0',
  border: '1px solid #e2e8f0',
};

const infoText = {
  fontSize: '14px',
  margin: '8px 0',
  color: '#334155',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
};