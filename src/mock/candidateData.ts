export type CandidateApplicationStatus =
    | 'pending'
    | 'reviewing'
    | 'interview'
    | 'accepted'
    | 'rejected'
    | 'supplement'

export interface CandidateJob {
    id: string
    title: string
    department: string
    location: string
    deadline: string
    salary: string
    quantity: number
    matchScore: number
    summary: string
    featured?: boolean
    tags: string[]
}

export interface CandidateApplication {
    id: string
    jobId: string
    title: string
    department: string
    submittedDate: string
    status: CandidateApplicationStatus
    note: string
}

export interface CandidateAnnouncement {
    id: string
    title: string
    description: string
    createdAt: string
}

export interface CandidateProfile {
    fullName: string
    role: string
    email: string
    phone: string
    idNumber: string
    dateOfBirth: string
    address: string
    education: string
    experience: string
    strengths: string[]
}

export const candidateJobs: CandidateJob[] = [
    {
        id: '1',
        title: 'Chuyên viên phân tích dữ liệu nghiệp vụ',
        department: 'Cục Công nghệ thông tin',
        location: 'Hà Nội',
        deadline: '2026-04-30',
        salary: '15 - 25 triệu VND',
        quantity: 8,
        matchScore: 92,
        featured: true,
        summary:
            'Tham gia xây dựng hệ thống phân tích và báo cáo dữ liệu vận hành cho khối nghiệp vụ.',
        tags: ['Dữ liệu', 'Python', 'SQL'],
    },
    {
        id: '2',
        title: 'Chuyên viên pháp chế và tham mưu',
        department: 'Văn phòng Bộ',
        location: 'Hà Nội',
        deadline: '2026-04-18',
        salary: '13 - 18 triệu VND',
        quantity: 5,
        matchScore: 87,
        summary:
            'Tư vấn pháp lý, rà soát văn bản và hỗ trợ nghiệp vụ soạn thảo quy trình nội bộ.',
        tags: ['Pháp chế', 'Văn bản', 'Tham mưu'],
    },
    {
        id: '3',
        title: 'Kỹ thuật viên hạ tầng và an ninh mạng',
        department: 'Phòng CNTT Công an tỉnh Nghệ An',
        location: 'Nghệ An',
        deadline: '2026-03-29',
        salary: '14 - 20 triệu VND',
        quantity: 6,
        matchScore: 84,
        summary:
            'Vận hành hệ thống máy chủ, theo dõi sự cố và đảm bảo mức độ sẵn sàng của hạ tầng mạng.',
        tags: ['Hạ tầng', 'Bảo mật', 'Linux'],
    },
    {
        id: '4',
        title: 'Cán bộ hỗ trợ truyền thông nội bộ',
        department: 'Công an TP Hải Phòng',
        location: 'Hải Phòng',
        deadline: '2026-05-05',
        salary: '12 - 16 triệu VND',
        quantity: 4,
        matchScore: 79,
        summary:
            'Phụ trách nội dung, điều phối sự kiện và truyền thông hoạt động nội bộ của đơn vị.',
        tags: ['Nội dung', 'Sự kiện', 'Canva'],
    },
    {
        id: '5',
        title: 'Chuyên viên tổ chức cán bộ',
        department: 'Vụ Tổ chức cán bộ',
        location: 'Hà Nội',
        deadline: '2026-05-12',
        salary: '16 - 22 triệu VND',
        quantity: 3,
        matchScore: 90,
        featured: true,
        summary:
            'Phối hợp quy hoạch nhân sự, tổng hợp hồ sơ cán bộ và báo cáo tiến độ bổ nhiệm.',
        tags: ['Nhân sự', 'Tổng hợp', 'Văn phòng'],
    },
]

export const candidateApplications: CandidateApplication[] = [
    {
        id: 'app-1',
        jobId: '1',
        title: 'Chuyên viên phân tích dữ liệu nghiệp vụ',
        department: 'Cục Công nghệ thông tin',
        submittedDate: '2026-03-05',
        status: 'reviewing',
        note: 'Hồ sơ đang được hội đồng chuyên môn đánh giá.',
    },
    {
        id: 'app-2',
        jobId: '5',
        title: 'Chuyên viên tổ chức cán bộ',
        department: 'Vụ Tổ chức cán bộ',
        submittedDate: '2026-02-27',
        status: 'interview',
        note: 'Đã xếp lịch phỏng vấn vào 09:00 ngày 18/03/2026.',
    },
    {
        id: 'app-3',
        jobId: '2',
        title: 'Chuyên viên pháp chế và tham mưu',
        department: 'Văn phòng Bộ',
        submittedDate: '2026-02-19',
        status: 'supplement',
        note: 'Cần bổ sung bản scan bằng cấp và xác nhận cư trú.',
    },
]

export const candidateAnnouncements: CandidateAnnouncement[] = [
    {
        id: 'news-1',
        title: 'Cập nhật lịch phỏng vấn đợt 2 tháng 3',
        description:
            'Hội đồng tuyển dụng đã công bố lịch phỏng vấn bổ sung cho nhóm vị trí khối CNTT và tham mưu.',
        createdAt: '2026-03-12',
    },
    {
        id: 'news-2',
        title: 'Mở thêm 03 vị trí ưu tiên ứng viên nội bộ',
        description:
            'Ba vị trí mới đã được mở trong khối tổ chức cán bộ và văn phòng tổng hợp.',
        createdAt: '2026-03-10',
    },
]

export const candidateProfile: CandidateProfile = {
    fullName: 'Nguyễn Văn Anh',
    role: 'Ứng viên',
    email: 'nguyenvananh@example.com',
    phone: '0912 345 678',
    idNumber: '001234567890',
    dateOfBirth: '1997-05-15',
    address: 'Số 123, đường Yết Kiêu, Hoàn Kiếm, Hà Nội',
    education:
        'Đại học Bách Khoa Hà Nội, chuyên ngành Khoa học dữ liệu và trí tuệ nhân tạo',
    experience:
        '03 năm phân tích dữ liệu, xây dựng dashboard vận hành và báo cáo KPI cho khối nghiệp vụ.',
    strengths: [
        'Python',
        'SQL',
        'Power BI',
        'Tổng hợp báo cáo',
        'Tư duy hệ thống',
    ],
}
