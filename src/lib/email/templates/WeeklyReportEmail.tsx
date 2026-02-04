import {
  Body,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface WeeklyReportEmailProps {
  username?: string;
  startDate?: string;
  endDate?: string;
  questionsSolved?: number;
  studyTimeHours?: number;
  xpEarned?: number;
  topSubject?: string;
}

export const WeeklyReportEmail = ({
  username = '同学',
  startDate = '2026-02-01',
  endDate = '2026-02-07',
  questionsSolved = 150,
  studyTimeHours = 12.5,
  xpEarned = 2500,
  topSubject = '数学',
}: WeeklyReportEmailProps) => (
  <Html>
    <Head />
    <Preview>本周学习周报已送达！看看你的进步吧。</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={heading}>学习周报</Heading>
          <Text style={dateRange}>{startDate} 至 {endDate}</Text>
        </Section>
        <Section style={content}>
          <Text style={paragraph}>你好，{username}！</Text>
          <Text style={paragraph}>
            又是充满进步的一周！以下是你本周的学习成果摘要：
          </Text>
          
          <Section style={statsGrid}>
            <Row>
              <Column style={statCard}>
                <Text style={statLabel}>完成题目</Text>
                <Text style={statValue}>{questionsSolved}</Text>
              </Column>
              <Column style={statCard}>
                <Text style={statLabel}>学习时长</Text>
                <Text style={statValue}>{studyTimeHours}h</Text>
              </Column>
            </Row>
            <Row>
              <Column style={statCard}>
                <Text style={statLabel}>获得经验</Text>
                <Text style={statValue}>{xpEarned} XP</Text>
              </Column>
              <Column style={statCard}>
                <Text style={statLabel}>最专注科目</Text>
                <Text style={statValue}>{topSubject}</Text>
              </Column>
            </Row>
          </Section>

          <Text style={paragraph}>
            继续保持！每一份努力都在为你通向优秀的未来铺路。
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            想要查看更详细的报告？请登录 LearnMore 仪表盘。<br />
            © 2026 LearnMore. All rights reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default WeeklyReportEmail;

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
  backgroundColor: '#3b82f6',
  color: '#ffffff',
};

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
  color: '#ffffff',
};

const dateRange = {
  fontSize: '14px',
  margin: '8px 0 0',
  opacity: 0.8,
};

const content = {
  padding: '24px 32px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#484848',
};

const statsGrid = {
  margin: '24px 0',
};

const statCard = {
  padding: '16px',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  textAlign: 'center' as const,
  width: '50%',
};

const statLabel = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '0 0 4px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
};

const statValue = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
};
