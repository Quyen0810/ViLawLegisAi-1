export default function Loading() {
  return (
    <div className="min-h-screen theme-bg">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
            <div>
              <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-64 bg-gray-100 rounded mt-2 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-gray-100 rounded-lg animate-pulse" />
            <div className="w-9 h-9 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex flex-col">
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* AI message skeleton */}
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-80 bg-gray-100 rounded animate-pulse" />
                  </div>
                </div>

                {/* User message skeleton */}
                <div className="flex items-start space-x-3 justify-end">
                  <div className="space-y-2 text-right">
                    <div className="h-4 w-72 bg-primary-200 rounded animate-pulse" />
                    <div className="h-4 w-40 bg-primary-100 rounded animate-pulse ml-auto" />
                  </div>
                  <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse" />
                </div>

                {/* Typing dots */}
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:100ms]" />
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:200ms]" />
                </div>
              </div>

              <div className="border-t border-gray-200 p-4">
                <div className="flex items-end space-x-3">
                  <div className="flex-1">
                    <div className="h-12 bg-gray-100 border border-gray-200 rounded-lg animate-pulse" />
                  </div>
                  <div className="w-12 h-12 bg-gray-100 rounded-lg animate-pulse" />
                  <div className="w-12 h-12 bg-primary-200 rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="h-5 w-40 bg-gray-200 rounded mb-4 animate-pulse" />
              <div className="mb-4 h-10 bg-gray-100 rounded-lg animate-pulse" />
              <div className="space-y-3">
                <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="h-4 w-28 bg-gray-200 rounded mb-3 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-9 bg-gray-100 rounded-lg animate-pulse" />
                  <div className="h-9 bg-gray-100 rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


