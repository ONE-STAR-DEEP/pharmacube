import { DataTable } from '@/components/Datatable';
import { columns } from '@/components/TableColumns';
import { Button } from '@/components/ui/button';
import { getData } from '@/lib/actions/fetchQueries'
import { RefreshCcw } from 'lucide-react';


const AllBills = async () => {

  const data = await getData();
  console.log(data);

  return (
    <div className='w-full my-4 space-y-4'>
      <section className='w-full flex border rounded-2xl p-4 items-center justify-between'>
        <h1>Today's Activity</h1>
        <Button>
          <RefreshCcw /> Refresh
        </Button>
      </section>

      <section className="border rounded-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-xl m-4 font-semibold tracking-tight">
            Pending Bills
          </h1>

          {/* optional future */}
          {/* <Button size="sm">New Bill</Button> */}
        </div>

        <div className="rounded-xl bg-card px-4 pb-4">
          <DataTable data={data || []} columns={columns} />
          <div className="flex items-center justify-between px-4 py-3 border-t">
            {/* Left side */}
            <div className="text-sm text-muted-foreground">
              Showing 1–10 of 100
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm border rounded-md hover:bg-muted">
                Previous
              </button>

              <button className="px-3 py-1 text-sm border rounded-md bg-primary text-white">
                1
              </button>

              <button className="px-3 py-1 text-sm border rounded-md hover:bg-muted">
                2
              </button>

              <button className="px-3 py-1 text-sm border rounded-md hover:bg-muted">
                3
              </button>

              <span className="px-2 text-sm">...</span>

              <button className="px-3 py-1 text-sm border rounded-md hover:bg-muted">
                10
              </button>

              <button className="px-3 py-1 text-sm border rounded-md hover:bg-muted">
                Next
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AllBills