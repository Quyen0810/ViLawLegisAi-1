import { auth } from "@/auth";
import UserTable from "@/components/admin/user.table";
import { sendRequest } from "@/utils/api";

interface ISearchParams {
    [key: string]: string | string[] | undefined;
}

interface IProps {
    params: { id: string }
    searchParams: Promise<ISearchParams>
}

const ManageUserPage = async ({ searchParams }: IProps) => {
    // Chờ searchParams (theo yêu cầu Next.js 15)
    const sp = await searchParams;

    const current = sp?.current ? Number(sp.current) : 1;
    const pageSize = sp?.pageSize ? Number(sp.pageSize) : 10;

    const session = await auth();

    const res = await sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users`,
        method: "GET",
        queryParams: {
            current,
            pageSize
        },
        headers: {
            Authorization: `Bearer ${session?.user?.access_token}`,
        },
        nextOption: {
            next: { tags: ['list-users'] }
        }
    })

    const meta = res?.data?.meta ?? {
        current,
        pageSize,
        pages: 1,
        total: res?.data?.results?.length ?? 0
    };

    return (
        <div>
            <UserTable
                users={res?.data?.results ?? []}
                meta={meta}
            />
        </div>
    )
}

export default ManageUserPage;
