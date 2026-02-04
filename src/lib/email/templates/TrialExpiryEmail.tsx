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

interface TrialExpiryEmailProps {
  username?: string;
  daysLeft?: number;
  urgency?: 'warning' | 'urgent';
  upgradeUrl?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';

export const TrialExpiryEmail = ({
  username = '同学',
  daysLeft = 3,
  urgency = 'warning',
  upgradeUrl = `${baseUrl}/pricing`,
}: TrialExpiryEmailProps) => (
  <Html>
    <Head />
    <Preview>{urgency === 'urgent' ? '⚡ 紧急：你的试用期明天结束！' : '温馨提醒：你的试用期即将结束'}</Preview>
    <Body style={main}>
      <Container style={container}>
        {urgency === 'urgent' && (
          <Section style={urgentBanner}>
            <Text style={urgentBannerText}>⚡ 紧急警告：您的试用期明天结束，请立即采取行动。</Text>
          </Section>
        )}
        <Section style={header}>
          <Heading style={heading}>试用期提醒</Heading>
        </Section>
        <Section style={content}>
          <Text style={paragraph}>你好，{username}！</Text>
          <Text style={paragraph}>
            你的免费试用期将于 <strong>{daysLeft <= 1 ? '明天' : `${daysLeft} 天后`}</strong> 结束。为了确保你的学习进度不被中断，建议你及时升级订阅。
          </Text>
          <Text style={paragraph}>
            升级后，你将继续享有：
            <ul style={list}>
              <li>无限制使用 AI 智能导师</li>
              <li>解锁全部进阶题库</li>
              <li>获取详细的学习进度报告</li>
            </ul>
          </Text>
          <Section style={buttonContainer}>
            <Link style={urgency === 'urgent' ? buttonUrgent : button} href={upgradeUrl}>
              立即升级
            </Link>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            如果你有任何问题，欢迎随时联系我们。<br />
            © 2026 LearnMore. All rights reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default TrialExpiryEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
};

const urgentBanner = {
  backgroundColor: '#dc2626',
  padding: '12px 24px',
  textAlign: 'center' as const,
};

const urgentBannerText = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0',
};

const header = {
  padding: '32px',
  textAlign: 'center' as const,
  backgroundColor: '#fff7ed',
};

const heading = {
  color: '#ea580c',
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

const list = {
  color: '#484848',
  fontSize: '15px',
  lineHeight: '24px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#ea580c',
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

const buttonUrgent = {
  ...button,
  backgroundColor: '#dc2626',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
};
