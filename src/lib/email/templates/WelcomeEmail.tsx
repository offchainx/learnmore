import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  username?: string;
  loginUrl?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';

export const WelcomeEmail = ({
  username = '同学',
  loginUrl = `${baseUrl}/login`,
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>欢迎加入 LearnMore，开启你的智慧学习之旅！</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
           <Heading style={heading}>LearnMore</Heading>
        </Section>
        <Section style={content}>
          <Heading style={subHeading}>你好，{username}！</Heading>
          <Text style={paragraph}>
            欢迎加入 LearnMore！我们很高兴能陪伴你一起进步。在这里，你可以通过 AI 智能导师、海量题库和科学的复习计划，更高效地掌握知识。
          </Text>
          <Section style={buttonContainer}>
            <Link style={button} href={loginUrl}>
              立即开启学习
            </Link>
          </Section>
          <Text style={paragraph}>
            如果你有任何疑问，请随时通过应用内的反馈功能联系我们。
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            此邮件由系统自动发出，请勿直接回复。<br />
            © 2026 LearnMore. All rights reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
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
};

const heading = {
  color: '#0070f3',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
};

const content = {
  padding: '0 32px',
};

const subHeading = {
  fontSize: '20px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#484848',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#484848',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#0070f3',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  width: '200px',
  padding: '12px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
};
