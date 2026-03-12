export const dashboardStats = [
    {
        key: 'postings',
        label: 'Tổng tin tuyển dụng',
        value: '1,234',
        change: '+12.5% so với tháng trước',
    },
    {
        key: 'candidates',
        label: 'Tổng ứng viên',
        value: '5,678',
        change: '+8.2% lượng hồ sơ mới',
    },
    {
        key: 'campaigns',
        label: 'Chiến dịch đang hoạt động',
        value: '45',
        change: '+3 chiến dịch mới',
    },
    {
        key: 'pending',
        label: 'Hồ sơ chờ duyệt',
        value: '234',
        change: '-5.4% tồn đọng',
    },
]

export const activityTrend = [
    { month: 'T1', applications: 420, postings: 45 },
    { month: 'T2', applications: 380, postings: 52 },
    { month: 'T3', applications: 520, postings: 48 },
    { month: 'T4', applications: 610, postings: 65 },
    { month: 'T5', applications: 580, postings: 58 },
    { month: 'T6', applications: 690, postings: 72 },
]

export const recruitmentStatus = [
    { name: 'Đã duyệt', value: 450 },
    { name: 'Chờ duyệt', value: 234 },
    { name: 'Từ chối', value: 89 },
    { name: 'Hết hạn', value: 156 },
]

export const recentApplications = [
    {
        key: 1,
        candidate: 'Nguyễn Văn A',
        position: 'Cảnh sát điều tra',
        unit: 'Công an TP Hà Nội',
        status: 'Chờ duyệt',
        date: '09/03/2026',
    },
    {
        key: 2,
        candidate: 'Trần Thị B',
        position: 'Kỹ thuật viên',
        unit: 'Công an tỉnh Nghệ An',
        status: 'Đã duyệt',
        date: '09/03/2026',
    },
    {
        key: 3,
        candidate: 'Lê Văn C',
        position: 'Nhân viên văn phòng',
        unit: 'Công an tỉnh Thanh Hóa',
        status: 'Đang xử lý',
        date: '08/03/2026',
    },
    {
        key: 4,
        candidate: 'Phạm Thị D',
        position: 'Cảnh sát giao thông',
        unit: 'Công an TP Đà Nẵng',
        status: 'Chờ duyệt',
        date: '08/03/2026',
    },
]

export const adminUsers = [
    {
        key: 1,
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@congannha.gov.vn',
        role: 'Quản trị viên',
        unit: 'Công an TP Hà Nội',
        status: 'Hoạt động',
        lastLogin: '09/03/2026 14:30',
    },
    {
        key: 2,
        name: 'Trần Thị B',
        email: 'tranthib@congannha.gov.vn',
        role: 'Nhân viên tuyển dụng',
        unit: 'Công an tỉnh Nghệ An',
        status: 'Hoạt động',
        lastLogin: '09/03/2026 10:15',
    },
    {
        key: 3,
        name: 'Lê Văn C',
        email: 'levanc@congannha.gov.vn',
        role: 'Nhân viên tuyển dụng',
        unit: 'Công an tỉnh Thanh Hóa',
        status: 'Tạm khóa',
        lastLogin: '08/03/2026 16:45',
    },
    {
        key: 4,
        name: 'Phạm Thị D',
        email: 'phamthid@congannha.gov.vn',
        role: 'Quản lý đơn vị',
        unit: 'Công an TP Đà Nẵng',
        status: 'Hoạt động',
        lastLogin: '09/03/2026 09:20',
    },
    {
        key: 5,
        name: 'Hoàng Văn E',
        email: 'hoangvane@congannha.gov.vn',
        role: 'Nhân viên tuyển dụng',
        unit: 'Công an TP Hải Phòng',
        status: 'Hoạt động',
        lastLogin: '08/03/2026 15:30',
    },
]

export const roleSummaries = [
    {
        id: 1,
        name: 'Quản trị viên',
        description: 'Toàn quyền quản trị hệ thống và cấu hình trọng yếu.',
        users: 5,
    },
    {
        id: 2,
        name: 'Quản lý đơn vị',
        description: 'Phê duyệt và giám sát tuyển dụng tại cấp đơn vị.',
        users: 12,
    },
    {
        id: 3,
        name: 'Nhân viên tuyển dụng',
        description: 'Xử lý hồ sơ, chiến dịch và trao đổi với ứng viên.',
        users: 45,
    },
    {
        id: 4,
        name: 'Người xem',
        description: 'Chỉ xem thông tin, không được chỉnh sửa dữ liệu.',
        users: 8,
    },
]

export const permissionMatrix = [
    {
        module: 'Quản lý người dùng',
        actions: [
            {
                name: 'Xem',
                admin: true,
                manager: true,
                recruiter: false,
                viewer: true,
            },
            {
                name: 'Tạo',
                admin: true,
                manager: false,
                recruiter: false,
                viewer: false,
            },
            {
                name: 'Sửa',
                admin: true,
                manager: false,
                recruiter: false,
                viewer: false,
            },
            {
                name: 'Xóa',
                admin: true,
                manager: false,
                recruiter: false,
                viewer: false,
            },
        ],
    },
    {
        module: 'Quản lý tuyển dụng',
        actions: [
            {
                name: 'Xem',
                admin: true,
                manager: true,
                recruiter: true,
                viewer: true,
            },
            {
                name: 'Tạo',
                admin: true,
                manager: true,
                recruiter: true,
                viewer: false,
            },
            {
                name: 'Sửa',
                admin: true,
                manager: true,
                recruiter: true,
                viewer: false,
            },
            {
                name: 'Duyệt',
                admin: true,
                manager: true,
                recruiter: false,
                viewer: false,
            },
        ],
    },
    {
        module: 'Quản lý đơn vị',
        actions: [
            {
                name: 'Xem',
                admin: true,
                manager: true,
                recruiter: true,
                viewer: true,
            },
            {
                name: 'Tạo',
                admin: true,
                manager: false,
                recruiter: false,
                viewer: false,
            },
            {
                name: 'Sửa',
                admin: true,
                manager: false,
                recruiter: false,
                viewer: false,
            },
            {
                name: 'Xóa',
                admin: true,
                manager: false,
                recruiter: false,
                viewer: false,
            },
        ],
    },
    {
        module: 'Báo cáo & thống kê',
        actions: [
            {
                name: 'Xem',
                admin: true,
                manager: true,
                recruiter: true,
                viewer: true,
            },
            {
                name: 'Xuất file',
                admin: true,
                manager: true,
                recruiter: false,
                viewer: false,
            },
        ],
    },
]

export const organizations = [
    {
        key: 1,
        name: 'Công an TP Hà Nội',
        code: 'CA-HN-001',
        address: 'Hà Nội',
        contact: 'Đại tá Nguyễn Văn A',
        phone: '024.3826.xxxx',
        email: 'cahanoi@congannha.gov.vn',
        users: 25,
        activeRecruitments: 5,
        status: 'Hoạt động',
    },
    {
        key: 2,
        name: 'Công an tỉnh Nghệ An',
        code: 'CA-NA-002',
        address: 'Vinh, Nghệ An',
        contact: 'Đại tá Trần Văn B',
        phone: '0238.3841.xxxx',
        email: 'canghean@congannha.gov.vn',
        users: 18,
        activeRecruitments: 3,
        status: 'Hoạt động',
    },
    {
        key: 3,
        name: 'Công an tỉnh Thanh Hóa',
        code: 'CA-TH-003',
        address: 'Thanh Hóa',
        contact: 'Đại tá Lê Văn C',
        phone: '0237.3852.xxxx',
        email: 'cathanhhoa@congannha.gov.vn',
        users: 15,
        activeRecruitments: 2,
        status: 'Hoạt động',
    },
    {
        key: 4,
        name: 'Công an TP Đà Nẵng',
        code: 'CA-DN-004',
        address: 'Đà Nẵng',
        contact: 'Đại tá Phạm Văn D',
        phone: '0236.3821.xxxx',
        email: 'cadanang@congannha.gov.vn',
        users: 20,
        activeRecruitments: 4,
        status: 'Hoạt động',
    },
    {
        key: 5,
        name: 'Công an TP Hải Phòng',
        code: 'CA-HP-005',
        address: 'Hải Phòng',
        contact: 'Đại tá Hoàng Văn E',
        phone: '0225.3822.xxxx',
        email: 'cahaiphong@congannha.gov.vn',
        users: 16,
        activeRecruitments: 3,
        status: 'Tạm dừng',
    },
]

export const recruitmentStats = [
    { key: 'all', label: 'Tổng tin tuyển dụng', value: '1,234' },
    { key: 'pending', label: 'Chờ duyệt', value: '234' },
    { key: 'approved', label: 'Đã duyệt', value: '890' },
    { key: 'rejected', label: 'Từ chối', value: '110' },
]

export const recruitments = [
    {
        key: 1,
        title: 'Tuyển dụng Cảnh sát điều tra',
        unit: 'Công an TP Hà Nội',
        position: 'Cảnh sát điều tra',
        quantity: 15,
        applications: 234,
        status: 'Chờ duyệt',
        deadline: '30/03/2026',
        createdDate: '01/03/2026',
    },
    {
        key: 2,
        title: 'Tuyển dụng Kỹ thuật viên IT',
        unit: 'Công an tỉnh Nghệ An',
        position: 'Kỹ thuật viên',
        quantity: 5,
        applications: 89,
        status: 'Đã duyệt',
        deadline: '25/03/2026',
        createdDate: '28/02/2026',
    },
    {
        key: 3,
        title: 'Tuyển dụng Nhân viên văn phòng',
        unit: 'Công an tỉnh Thanh Hóa',
        position: 'Nhân viên văn phòng',
        quantity: 8,
        applications: 156,
        status: 'Đã duyệt',
        deadline: '20/03/2026',
        createdDate: '25/02/2026',
    },
    {
        key: 4,
        title: 'Tuyển dụng Cảnh sát giao thông',
        unit: 'Công an TP Đà Nẵng',
        position: 'Cảnh sát giao thông',
        quantity: 12,
        applications: 198,
        status: 'Chờ duyệt',
        deadline: '15/04/2026',
        createdDate: '05/03/2026',
    },
    {
        key: 5,
        title: 'Tuyển dụng Chuyên viên pháp chế',
        unit: 'Công an TP Hải Phòng',
        position: 'Chuyên viên pháp chế',
        quantity: 3,
        applications: 67,
        status: 'Từ chối',
        deadline: '10/03/2026',
        createdDate: '20/02/2026',
    },
]

export const cvFieldTypes = [
    { key: 'text', label: 'Văn bản' },
    { key: 'number', label: 'Số' },
    { key: 'date', label: 'Ngày tháng' },
    { key: 'select', label: 'Lựa chọn' },
    { key: 'file', label: 'Tải tệp' },
    { key: 'checkbox', label: 'Checkbox' },
]

export const cvTemplates = [
    {
        key: 1,
        name: 'Mẫu hồ sơ Cảnh sát điều tra',
        description: 'Mẫu hồ sơ cho vị trí cảnh sát điều tra.',
        fields: 15,
        usedBy: 5,
        status: 'Đang sử dụng',
        lastModified: '09/03/2026',
    },
    {
        key: 2,
        name: 'Mẫu hồ sơ Kỹ thuật viên',
        description: 'Mẫu hồ sơ cho vị trí kỹ thuật viên IT.',
        fields: 12,
        usedBy: 3,
        status: 'Đang sử dụng',
        lastModified: '08/03/2026',
    },
    {
        key: 3,
        name: 'Mẫu hồ sơ Nhân viên văn phòng',
        description: 'Mẫu hồ sơ cho vị trí nhân viên văn phòng.',
        fields: 10,
        usedBy: 4,
        status: 'Đang sử dụng',
        lastModified: '07/03/2026',
    },
    {
        key: 4,
        name: 'Mẫu hồ sơ Cảnh sát giao thông',
        description: 'Mẫu hồ sơ cho vị trí cảnh sát giao thông.',
        fields: 13,
        usedBy: 2,
        status: 'Nháp',
        lastModified: '06/03/2026',
    },
]

export const notifications = [
    {
        key: 1,
        title: 'Thông báo gia hạn thời gian nộp hồ sơ',
        content:
            'Thời gian nộp hồ sơ tuyển dụng vị trí Cảnh sát điều tra được gia hạn đến 15/04/2026.',
        recipients: 'Tất cả ứng viên',
        recipientCount: 1234,
        status: 'Đã gửi',
        sentDate: '09/03/2026 10:00',
        createdBy: 'Admin H05',
    },
    {
        key: 2,
        title: 'Cập nhật quy trình tuyển dụng năm 2026',
        content:
            'Bộ Công an thông báo cập nhật quy trình tuyển dụng mới áp dụng từ tháng 4/2026.',
        recipients: 'Tất cả đơn vị',
        recipientCount: 63,
        status: 'Đã gửi',
        sentDate: '08/03/2026 14:30',
        createdBy: 'Admin H05',
    },
    {
        key: 3,
        title: 'Lịch phỏng vấn đợt 1 - Công an TP Hà Nội',
        content:
            'Thông báo lịch phỏng vấn cho các ứng viên đạt yêu cầu vòng 1.',
        recipients: '234 ứng viên',
        recipientCount: 234,
        status: 'Nháp',
        sentDate: '-',
        createdBy: 'Admin H05',
    },
    {
        key: 4,
        title: 'Bảo trì hệ thống',
        content:
            'Hệ thống sẽ bảo trì từ 22:00 - 02:00 ngày 10/03/2026 để nâng cấp hạ tầng.',
        recipients: 'Tất cả người dùng',
        recipientCount: 1567,
        status: 'Đã lên lịch',
        sentDate: '10/03/2026 22:00',
        createdBy: 'Admin H05',
    },
]

export const notificationRecipientOptions = [
    { key: 'all-candidates', label: 'Tất cả ứng viên' },
    { key: 'all-units', label: 'Tất cả đơn vị' },
    { key: 'all-users', label: 'Tất cả người dùng' },
    { key: 'specific', label: 'Chọn cụ thể' },
]

export const reportMetrics = [
    {
        key: 'postings',
        label: 'Tổng tin tuyển dụng',
        value: '1,234',
        change: '+12.5%',
    },
    {
        key: 'candidates',
        label: 'Tổng ứng viên',
        value: '5,678',
        change: '+8.2%',
    },
    {
        key: 'conversion',
        label: 'Tỷ lệ chuyển đổi',
        value: '28%',
        change: '+3.1%',
    },
    {
        key: 'processing',
        label: 'Thời gian xử lý TB',
        value: '4.5 ngày',
        change: '-1.2 ngày',
    },
]

export const recruitmentByUnit = [
    { name: 'CA HN', postings: 45, applications: 520 },
    { name: 'CA NA', postings: 32, applications: 380 },
    { name: 'CA TH', postings: 28, applications: 310 },
    { name: 'CA DN', postings: 38, applications: 450 },
    { name: 'CA HP', postings: 25, applications: 280 },
]

export const monthlyTrend = [
    { month: 'T1', recruitments: 42, candidates: 450 },
    { month: 'T2', recruitments: 38, candidates: 420 },
    { month: 'T3', recruitments: 52, candidates: 580 },
    { month: 'T4', recruitments: 61, candidates: 650 },
    { month: 'T5', recruitments: 55, candidates: 590 },
    { month: 'T6', recruitments: 68, candidates: 720 },
]

export const statusDistribution = [
    { name: 'Đang xử lý', value: 234 },
    { name: 'Đã duyệt', value: 450 },
    { name: 'Từ chối', value: 89 },
    { name: 'Hoàn thành', value: 327 },
]

export const topPositions = [
    { position: 'Cảnh sát điều tra', applications: 234 },
    { position: 'Kỹ thuật viên IT', applications: 189 },
    { position: 'Nhân viên văn phòng', applications: 156 },
    { position: 'Cảnh sát giao thông', applications: 143 },
    { position: 'Chuyên viên pháp chế', applications: 98 },
]

export const reportExportOptions = [
    {
        key: 'recruitment',
        title: 'Báo cáo tuyển dụng',
        description: 'Thống kê chi tiết các tin tuyển dụng theo kỳ.',
    },
    {
        key: 'organization',
        title: 'Báo cáo theo đơn vị',
        description: 'Phân tích hiệu quả tuyển dụng của từng đơn vị.',
    },
    {
        key: 'candidate',
        title: 'Thống kê ứng viên',
        description: 'Dữ liệu chuyên sâu về nguồn hồ sơ và tỷ lệ đạt.',
    },
]

export const systemLogs = [
    {
        key: 1,
        type: 'login',
        severity: 'info',
        user: 'admin@congannha.gov.vn',
        action: 'Đăng nhập thành công',
        ip: '192.168.1.100',
        timestamp: '09/03/2026 14:35:22',
        details: 'Đăng nhập từ trình duyệt Chrome.',
    },
    {
        key: 2,
        type: 'security',
        severity: 'warning',
        user: 'nguyenvana@congannha.gov.vn',
        action: 'Đăng nhập thất bại',
        ip: '192.168.1.105',
        timestamp: '09/03/2026 14:30:15',
        details: 'Sai mật khẩu lần thử thứ 3 trên 5.',
    },
    {
        key: 3,
        type: 'operation',
        severity: 'success',
        user: 'admin@congannha.gov.vn',
        action: 'Tạo người dùng mới',
        ip: '192.168.1.100',
        timestamp: '09/03/2026 14:25:10',
        details: 'Tạo tài khoản tranthib@congannha.gov.vn.',
    },
    {
        key: 4,
        type: 'operation',
        severity: 'success',
        user: 'manager@congannha.gov.vn',
        action: 'Phê duyệt tin tuyển dụng',
        ip: '192.168.1.110',
        timestamp: '09/03/2026 14:20:05',
        details: 'Phê duyệt tin Cảnh sát điều tra - CA Hà Nội.',
    },
    {
        key: 5,
        type: 'security',
        severity: 'error',
        user: 'unknown',
        action: 'Truy cập trái phép',
        ip: '203.162.15.89',
        timestamp: '09/03/2026 14:15:00',
        details: 'Cố gắng truy cập trang admin không có quyền.',
    },
    {
        key: 6,
        type: 'login',
        severity: 'info',
        user: 'recruiter@congannha.gov.vn',
        action: 'Đăng xuất',
        ip: '192.168.1.115',
        timestamp: '09/03/2026 14:10:45',
        details: 'Đăng xuất bình thường.',
    },
    {
        key: 7,
        type: 'operation',
        severity: 'success',
        user: 'admin@congannha.gov.vn',
        action: 'Cập nhật quyền hạn',
        ip: '192.168.1.100',
        timestamp: '09/03/2026 14:05:30',
        details: 'Thêm quyền quản lý đơn vị cho vai trò Manager.',
    },
    {
        key: 8,
        type: 'security',
        severity: 'warning',
        user: 'system',
        action: 'Phát hiện hoạt động bất thường',
        ip: '192.168.1.120',
        timestamp: '09/03/2026 14:00:00',
        details: 'Nhiều request liên tục từ cùng một địa chỉ IP.',
    },
]

export const profileHighlights = [
    { label: 'Vai trò', value: 'Quản trị viên hệ thống H05' },
    { label: 'Đơn vị', value: 'Bộ Công an - Khối quản trị trung tâm' },
    { label: 'Email', value: 'admin.h05@congannha.gov.vn' },
    { label: 'Điện thoại', value: '024.3999.8899' },
]

export const profileSummary = [
    { label: 'Phiên trực tuyến', value: '12' },
    { label: 'Tác vụ phê duyệt', value: '184' },
    { label: 'Thông báo đã gửi', value: '245' },
    { label: 'Cảnh báo bảo mật', value: '05' },
]

export const profilePermissions = [
    'Quản trị tài khoản người dùng',
    'Phê duyệt chiến dịch tuyển dụng',
    'Quản lý vai trò & quyền hạn',
    'Xuất báo cáo nghiệp vụ',
]

export const profileActivities = [
    {
        title: 'Phê duyệt chiến dịch tuyển dụng mới',
        time: '09/03/2026 14:20',
        description:
            'Chiến dịch tuyển dụng Cảnh sát điều tra - Công an TP Hà Nội.',
    },
    {
        title: 'Cập nhật nhóm quyền manager',
        time: '09/03/2026 14:05',
        description: 'Thêm quyền truy cập module quản lý đơn vị.',
    },
    {
        title: 'Gửi thông báo toàn hệ thống',
        time: '08/03/2026 14:30',
        description: 'Thông báo cập nhật quy trình tuyển dụng năm 2026.',
    },
]
