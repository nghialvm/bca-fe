import {
    Alert,
    Card,
    Col,
    Empty,
    List,
    Progress,
    Row,
    Space,
    Tag,
    Timeline,
    Typography,
} from 'antd'

import {
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    FileProtectOutlined,
    FileTextOutlined,
    InfoCircleOutlined,
    SolutionOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

import { useCandidateWorkspace } from '@/hooks/useCandidateWorkspace'
import { getApplicationStatusColor, getApplicationStatusLabel } from '@/utils/admin'
import {
    getCandidateApplicationProgress,
    isCandidateActionRequired,
} from '@/utils/candidate'

const { Paragraph, Text, Title } = Typography

const CandidateApplicationPage = () => {
    const { applications, loading } = useCandidateWorkspace()
    const actionItems = applications.filter((item) =>
        isCandidateActionRequired(item.status)
    )

    return (
        <div className="portal-page">
            <section className="portal-hero">
                <span className="portal-hero__eyebrow">Theo doi ho so</span>
                <Title level={2}>Theo doi tung ho so ung tuyen theo thoi gian</Title>
                <Paragraph style={{ maxWidth: 760 }}>
                    Danh sach ben duoi lay truc tiep tu candidate portal API va gom
                    day du ma ho so, trang thai xu ly va thong tin vi tri tuyen dung.
                </Paragraph>
            </section>

            <Alert
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
                message="Luu y"
                description="Cac ho so dang o vong phong van hoac da gui offer se duoc uu tien hien thi trong muc viec can lam de ban thao tac nhanh hon."
            />

            <Row gutter={[24, 24]}>
                <Col xs={24} xl={16}>
                    <Card title="Danh sach ho so" className="portal-section-card">
                        {applications.length ? (
                            <List
                                loading={loading}
                                dataSource={applications}
                                renderItem={(item) => {
                                    const label = getApplicationStatusLabel(
                                        item.status
                                    )
                                    const color = getApplicationStatusColor(
                                        item.status
                                    )

                                    return (
                                        <List.Item>
                                            <div style={{ width: '100%' }}>
                                                <div className="portal-split">
                                                    <div>
                                                        <Title
                                                            level={5}
                                                            style={{
                                                                marginBottom: 4,
                                                            }}
                                                        >
                                                            {item.title}
                                                        </Title>
                                                        <Text className="portal-muted">
                                                            {item.departmentName}
                                                        </Text>
                                                    </div>
                                                    <Tag color={color}>{label}</Tag>
                                                </div>

                                                <Space
                                                    wrap
                                                    size="large"
                                                    style={{ marginTop: 16 }}
                                                >
                                                    <Text>
                                                        <FileTextOutlined /> Ma ho so:{' '}
                                                        {item.applicationCode}
                                                    </Text>
                                                    <Text>
                                                        <CalendarOutlined /> Nop:{' '}
                                                        {dayjs(item.appliedTime).format(
                                                            'DD/MM/YYYY'
                                                        )}
                                                    </Text>
                                                </Space>

                                                <Paragraph
                                                    className="portal-muted"
                                                    style={{ marginTop: 12 }}
                                                >
                                                    {item.note ||
                                                        `${item.jobPositionName || 'Vi tri'}${item.workLocation ? ` tai ${item.workLocation}` : ''}.`}
                                                </Paragraph>

                                                <Progress
                                                    percent={getCandidateApplicationProgress(
                                                        item.status
                                                    )}
                                                    strokeColor="#0B3D2E"
                                                    showInfo={false}
                                                />
                                            </div>
                                        </List.Item>
                                    )
                                }}
                            />
                        ) : (
                            <Empty description="Ban chua nop ho so ung tuyen nao" />
                        )}
                    </Card>
                </Col>

                <Col xs={24} xl={8}>
                    <Space
                        direction="vertical"
                        size={24}
                        style={{ width: '100%' }}
                    >
                        <Card
                            title="Trang thai xu ly"
                            className="portal-section-card"
                        >
                            <Timeline
                                items={[
                                    {
                                        color: '#0B3D2E',
                                        dot: <ClockCircleOutlined />,
                                        children: 'Tiep nhan va doi chieu ho so',
                                    },
                                    {
                                        color: '#2E7D60',
                                        dot: <FileProtectOutlined />,
                                        children: 'Sang loc va danh gia chuyen mon',
                                    },
                                    {
                                        color: '#B7791F',
                                        dot: <SolutionOutlined />,
                                        children: 'Phong van va xu ly offer',
                                    },
                                    {
                                        color: '#166534',
                                        dot: <CheckCircleOutlined />,
                                        children:
                                            'Thong bao ket qua va huong dan tiep theo',
                                    },
                                ]}
                            />
                        </Card>

                        <Card
                            title="Viec can lam"
                            className="portal-section-card"
                        >
                            {actionItems.length ? (
                                <List
                                    loading={loading}
                                    dataSource={actionItems}
                                    renderItem={(item) => (
                                        <List.Item>
                                            <div>
                                                <Text strong>{item.title}</Text>
                                                <Paragraph
                                                    className="portal-muted"
                                                    style={{ margin: '6px 0 0' }}
                                                >
                                                    {item.note ||
                                                        `${getApplicationStatusLabel(item.status)} - theo doi email va thong bao he thong.`}
                                                </Paragraph>
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            ) : (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description="Hien khong co tac vu can xu ly ngay"
                                />
                            )}
                        </Card>
                    </Space>
                </Col>
            </Row>
        </div>
    )
}

export default CandidateApplicationPage
