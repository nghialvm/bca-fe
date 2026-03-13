export type RecruitmentStage =
    | 'application'
    | 'screening'
    | 'written-exam'
    | 'interview'
    | 'selected'
    | 'rejected'

export type JobStatus = 'draft' | 'active' | 'closed'

export interface EmployerJob {
    id: string
    title: string
    department: string
    location: string
    type: 'full-time' | 'part-time' | 'contract'
    status: JobStatus
    applicants: number
    createdAt: string
    deadline: string
    description: string
    requirements: string[]
    salary: string
}

export interface EmployerCandidate {
    id: string
    name: string
    email: string
    phone: string
    position: string
    jobId: string
    stage: RecruitmentStage
    appliedDate: string
    experience: string
    education: string
    skills: string[]
    score: number
}

export interface EmployerInterview {
    id: string
    candidateId: string
    candidateName: string
    position: string
    date: string
    time: string
    interviewer: string
    type: 'phone' | 'video' | 'in-person'
    status: 'scheduled' | 'completed' | 'cancelled'
    notes?: string
}

export interface MessageTemplate {
    id: string
    title: string
    subject: string
    type: 'invitation' | 'rejection' | 'acceptance' | 'reminder'
    content: string
}

export interface RecentMessage {
    id: string
    title: string
    receiver: string
    sentAt: string
    tone: 'default' | 'success'
}

export const employerJobs: EmployerJob[] = [
    {
        id: '1',
        title: 'Chuyên viên phân tích dữ liệu',
        department: 'Khối Công nghệ thông tin',
        location: 'Hà Nội',
        type: 'full-time',
        status: 'active',
        applicants: 45,
        createdAt: '2026-02-15',
        deadline: '2026-03-30',
        description:
            'Tìm kiếm chuyên viên phân tích dữ liệu để tham gia các dự án chuyển đổi số.',
        requirements: ['Python', 'SQL', 'Power BI'],
        salary: '15 - 25 triệu VND',
    },
    {
        id: '2',
        title: 'Kế toán trưởng',
        department: 'Tài chính - Kế toán',
        location: 'TP Hồ Chí Minh',
        type: 'full-time',
        status: 'active',
        applicants: 32,
        createdAt: '2026-02-20',
        deadline: '2026-04-10',
        description: 'Quản lý và điều hành bộ phận tài chính kế toán.',
        requirements: ['CPA', 'Báo cáo tài chính', 'SAP'],
        salary: '25 - 35 triệu VND',
    },
    {
        id: '3',
        title: 'Nhân viên Marketing',
        department: 'Truyền thông',
        location: 'Đà Nẵng',
        type: 'full-time',
        status: 'active',
        applicants: 58,
        createdAt: '2026-02-25',
        deadline: '2026-03-25',
        description: 'Phát triển chiến dịch nội dung và social media.',
        requirements: ['Content', 'Social media', 'Analytics'],
        salary: '10 - 15 triệu VND',
    },
    {
        id: '4',
        title: 'Trưởng phòng Nhân sự',
        department: 'Nhân sự',
        location: 'Hà Nội',
        type: 'full-time',
        status: 'draft',
        applicants: 0,
        createdAt: '2026-03-01',
        deadline: '2026-04-15',
        description: 'Xây dựng hệ thống đánh giá và phát triển đội ngũ.',
        requirements: ['Leadership', 'HRBP', 'Strategy'],
        salary: '30 - 40 triệu VND',
    },
    {
        id: '5',
        title: 'Kỹ sư vận hành hạ tầng',
        department: 'Trung tâm CNTT',
        location: 'Hải Phòng',
        type: 'contract',
        status: 'closed',
        applicants: 20,
        createdAt: '2026-01-25',
        deadline: '2026-03-05',
        description: 'Vận hành hạ tầng máy chủ và hệ thống giám sát.',
        requirements: ['Linux', 'Networking', 'Monitoring'],
        salary: '18 - 24 triệu VND',
    },
]

export const employerCandidates: EmployerCandidate[] = [
    {
        id: '1',
        name: 'Nguyễn Văn An',
        email: 'nguyenvanan@email.com',
        phone: '0901234567',
        position: 'Chuyên viên phân tích dữ liệu',
        jobId: '1',
        stage: 'interview',
        appliedDate: '2026-02-18',
        experience: '03 năm kinh nghiệm tại FPT Software',
        education: 'Đại học Bách Khoa Hà Nội - CNTT',
        skills: ['Python', 'SQL', 'Power BI', 'Machine Learning'],
        score: 85,
    },
    {
        id: '2',
        name: 'Trần Thị Bích',
        email: 'tranthibich@email.com',
        phone: '0912345678',
        position: 'Chuyên viên phân tích dữ liệu',
        jobId: '1',
        stage: 'screening',
        appliedDate: '2026-02-20',
        experience: '02 năm kinh nghiệm',
        education: 'Đại học Kinh tế Quốc dân - Thống kê',
        skills: ['Excel', 'SQL', 'Tableau'],
        score: 75,
    },
    {
        id: '3',
        name: 'Lê Minh Cường',
        email: 'leminhcuong@email.com',
        phone: '0923456789',
        position: 'Kế toán trưởng',
        jobId: '2',
        stage: 'written-exam',
        appliedDate: '2026-02-22',
        experience: '06 năm kinh nghiệm, có chứng chỉ CPA',
        education: 'Đại học Ngoại thương - Kế toán',
        skills: ['Kế toán tài chính', 'Kiểm toán', 'SAP', 'Excel'],
        score: 90,
    },
    {
        id: '4',
        name: 'Phạm Thu Hà',
        email: 'phamthuha@email.com',
        phone: '0934567890',
        position: 'Nhân viên Marketing',
        jobId: '3',
        stage: 'application',
        appliedDate: '2026-02-28',
        experience: '01 năm kinh nghiệm',
        education: 'Đại học KHXHNV - Marketing',
        skills: ['Social Media', 'Content Writing', 'Photoshop'],
        score: 70,
    },
    {
        id: '5',
        name: 'Hoàng Đức Duy',
        email: 'hoangducduy@email.com',
        phone: '0945678901',
        position: 'Chuyên viên phân tích dữ liệu',
        jobId: '1',
        stage: 'selected',
        appliedDate: '2026-02-16',
        experience: '04 năm kinh nghiệm',
        education: 'Đại học Bách Khoa TP HCM - Khoa học máy tính',
        skills: ['Python', 'R', 'Machine Learning', 'Big Data'],
        score: 95,
    },
    {
        id: '6',
        name: 'Võ Thị Em',
        email: 'vothiem@email.com',
        phone: '0956789012',
        position: 'Nhân viên Marketing',
        jobId: '3',
        stage: 'interview',
        appliedDate: '2026-02-26',
        experience: '02 năm kinh nghiệm',
        education: 'Đại học Kinh tế TP HCM - Marketing',
        skills: ['SEO', 'Google Ads', 'Facebook Ads', 'Analytics'],
        score: 82,
    },
]

export const employerInterviews: EmployerInterview[] = [
    {
        id: '1',
        candidateId: '1',
        candidateName: 'Nguyễn Văn An',
        position: 'Chuyên viên phân tích dữ liệu',
        date: '2026-03-18',
        time: '14:00',
        interviewer: 'Trần Văn Minh',
        type: 'in-person',
        status: 'scheduled',
        notes: 'Phỏng vấn vòng 2 - Technical interview',
    },
    {
        id: '2',
        candidateId: '6',
        candidateName: 'Võ Thị Em',
        position: 'Nhân viên Marketing',
        date: '2026-03-19',
        time: '10:00',
        interviewer: 'Lê Thị Hương',
        type: 'video',
        status: 'scheduled',
        notes: 'Phỏng vấn vòng 1',
    },
    {
        id: '3',
        candidateId: '5',
        candidateName: 'Hoàng Đức Duy',
        position: 'Chuyên viên phân tích dữ liệu',
        date: '2026-03-05',
        time: '15:00',
        interviewer: 'Trần Văn Minh',
        type: 'in-person',
        status: 'completed',
        notes: 'Ứng viên xuất sắc, đề xuất tuyển dụng',
    },
]

export const messageTemplates: MessageTemplate[] = [
    {
        id: '1',
        title: 'Mời phỏng vấn',
        subject: 'Thư mời phỏng vấn - [Vị trí ứng tuyển]',
        type: 'invitation',
        content:
            'Kính gửi [Tên ứng viên],\n\nHồ sơ của bạn đã được chọn cho vòng phỏng vấn tiếp theo. Vui lòng xác nhận lịch hẹn trước [Hạn xác nhận].\n\nTrân trọng,\nPhòng Nhân sự',
    },
    {
        id: '2',
        title: 'Thông báo từ chối',
        subject: 'Thông báo kết quả tuyển dụng',
        type: 'rejection',
        content:
            'Kính gửi [Tên ứng viên],\n\nCảm ơn bạn đã tham gia ứng tuyển. Sau khi xem xét, chúng tôi xin phép chưa thể tiếp tục với hồ sơ ở đợt này.\n\nTrân trọng,\nPhòng Nhân sự',
    },
    {
        id: '3',
        title: 'Thư chấp nhận tuyển dụng',
        subject: 'Chúc mừng bạn đã trúng tuyển',
        type: 'acceptance',
        content:
            'Kính gửi [Tên ứng viên],\n\nChúc mừng bạn đã được lựa chọn cho vị trí [Vị trí ứng tuyển]. Vui lòng xem hướng dẫn on-boarding đính kèm.\n\nTrân trọng,\nPhòng Nhân sự',
    },
    {
        id: '4',
        title: 'Nhắc lịch phỏng vấn',
        subject: 'Nhắc nhở lịch phỏng vấn sắp tới',
        type: 'reminder',
        content:
            'Kính gửi [Tên ứng viên],\n\nĐây là thư nhắc lịch phỏng vấn của bạn vào [Ngày giờ] tại [Địa chỉ]. Vui lòng có mặt đúng giờ.\n\nTrân trọng,\nPhòng Nhân sự',
    },
]

export const recentMessages: RecentMessage[] = [
    {
        id: '1',
        title: 'Mời phỏng vấn',
        receiver: 'Nguyễn Văn An',
        sentAt: '2026-03-12 10:30',
        tone: 'default',
    },
    {
        id: '2',
        title: 'Thư chấp nhận tuyển dụng',
        receiver: 'Hoàng Đức Duy',
        sentAt: '2026-03-10 14:15',
        tone: 'success',
    },
]

export const employerProfile = {
    organization: 'Công an TP Hà Nội',
    department: 'Phòng Tổ chức cán bộ',
    contactPerson: 'Nguyễn Văn A',
    email: 'tuyendung.hn@bca.gov.vn',
    phone: '024 3888 1122',
    address: '87 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội',
    description:
        'Đơn vị phụ trách tiếp nhận nhu cầu nhân sự, tổ chức các đợt tuyển dụng và điều phối hội đồng phỏng vấn.',
}
