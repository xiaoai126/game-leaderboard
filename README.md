### 目前已经实现功能：

- 分数更新 (updateScore): 透过 HTTP POST 请求 (/rank/update) 接收使用者 ID 和分数，使用 Redis 的 ZADD 指令更新排行榜。同时，透过 WebSocket 推送排名更新讯息给所有连线的用户。包含使用者ID、排名、以及更新后的分数与更新前的分数，方便前端判断排名变化。
- 查询排名 (getRank): 透过 HTTP GET 请求 (/rank) 接收使用者 ID，使用 Redis 的 ZREVRANK 指令查询使用者排名。
- 排行榜分页查询 (getLeaderboard): 透过 HTTP GET 请求 (/rank/leaderboard) 接收页码和每页数量参数，使用 Redis 的 ZREVRANGE 指令查询指定范围的排行榜资料，并同时回传使用者 ID 和分数。
- 查询周围排名 (getAround): 透过 HTTP GET 请求 (/rank/around) 接收使用者 ID 和查询数量参数，先取得目标使用者的排名，然后使用 Redis 的 ZREVRANGE 指令查询前后 N 名的玩家资料。
- WebSocket 实时推送 (rankUpdate event): 当分数更新时，伺服器会透过 WebSocket 的 rankUpdate 事件向所有连线的用户广播排名变更的讯息。
- 错误处理: 在 RankService 中加入了 try...catch 区块，处理 Redis 操作可能发生的错误，并使用 Logger 记录错误讯息。
- 跨域处理: 在WebSocketGateway加入cors配置，解决跨域问题。
- 上榜和超越通知: 目前只有推送排名变化，
- 断线重连机制: 在 WebSocket 中，当使用者断线时，需要重新连接到服务器。

### 尚未实现的功能，以及未來可以改進的方向

- 高并发处理: 目前的程式码使用单个 Redis 连线处理所有请求。在高并发的环境下，可能会成为效能瓶颈。建议使用 Redis 连线池、Pipeline 或 Lua 脚本来优化效能。也可以考虑使用消息伫列（例如 Bull 或 Redis 伫列）来处理分数更新请求，避免阻塞主执行绪。
- 排行榜资料快取: 为了进一步提升效能，可以在应用程式层使用快取（例如使用 Nest.js 的 CacheModule）来快取排行榜资料，减少对 Redis 的读取次数。
- 上榜和超越通知: 尚未实作上榜（从未上榜到进入排行榜）和超越（超越其他玩家）的独立通知。
- 断线重连机制: 虽然 WebSocket 有内建的断线重连机制，但应用程式层可以加入更完善的处理，例如在服务端维护连线状态，并在连线断开后清理相关资源。
- 更完善的错误处理和日志记录: 加入更详细的错误讯息和日志记录，方便追踪和除错。
- 单元测试和整合测试: 为了确保程式码的品质和稳定性，应该写单元测试和整合测试。

##### 总结:

- 目前的程式码提供了一个基本的游戏排行榜系统框架，包含分数更新、排名查询、分页查询、周围排名查询和 WebSocket 实时推送等功能。

### 选择 Nest.js 来实现游戏排行榜系统，主要基于以下几个优势：

- 结构化和模组化： Nest.js 采用了类似 Angular 的模组化架构，这使得程式码组织良好、易于维护和扩展。对于一个需要处理多个功能（例如分数更新、排名查询、WebSocket 通讯等）的系统来说，模组化架构可以有效地降低复杂度。

- TypeScript 支援： Nest.js 基于 TypeScript 构建，提供了静态类型检查、介面和装饰器等特性。这可以提高程式码的可读性、可维护性和可靠性，并在开发阶段及早发现潜在的错误。

- 依赖注入： Nest.js 内建了依赖注入（Dependency Injection）容器，这使得程式码更加松耦合、易于测试和重用。透过依赖注入，可以轻松地管理服务之间的依赖关系，并提高程式码的弹性和可测试性。

- WebSocket： Nest.js 提供了对 WebSocket 的良好支持，可以方便地建立和管理 WebSocket 连线，并实现即时通讯。这对于需要即时推送排名变化的游戏排行榜系统来说很方便也是选取点。

- 丰富的中间件和管道： Nest.js 提供了丰富的中间件（Middleware）和管道（Pipe），可以用于处理请求的预处理和后处理，例如验证请求资料、转换资料格式、处理错误等。这可以简化程式码，并提高开发效率。

### 测试方案

- 针对使用 Nest.js、Redis 和 WebSocket 构建的游戏排行榜系统，以下提供几种性能测试方案，涵盖不同层面，以确保系统在高负载下仍能稳定运行：

##### 单元测试 (Unit Testing):

- 目的： 针对程式码中的单个函数、方法或模组进行测试，验证其功能是否正确。
- 工具： Jest (Nest.js 预设测试框架)、Mocha、Chai 等。
  测试重点：
- RankService 中的每个方法，例如 updateScore、getRank、getLeaderboard、getAround 等，验证其逻辑是否正确，例如分数更新后排名是否正确、分页查询是否返回正确的资料等。
- 验证 Redis 操作是否正确，例如使用 Mock Redis Client 模拟 Redis 行为。

##### 整合测试 (Integration Testing):

- 目的： 测试多个模组或元件之间的协作，验证系统的整体功能是否正确。
  工具： Nest.js 的 TestingModule、Supertest 等。
- 测试重点：
  测试 HTTP 请求和 WebSocket 连线的整合，验证分数更新、排名查询和即时推送等功能是否正常运作。
  测试与 Redis 的整合，验证资料是否正确储存和读取。
  范例 (Nest.js TestingModule 和 Supertest): (略，较为复杂，可参考 Nest.js 官方文件)

##### 压力测试 (Load Testing):

- 目的： 模拟大量使用者同时访问系统，测试系统在高负载下的效能和稳定性。
- 工具：
  wrk: 轻量级 HTTP 压力测试工具。
  Apache JMeter: 功能强大的压力测试工具，支援多种协定。
  k6: 使用 JavaScript 编写脚本的现代化负载测试工具。
  Locust: 使用 Python 编写脚本的负载测试工具，易于扩展。
  测试重点：
  TPS (Transactions Per Second): 每秒处理的交易数。
  延迟 (Latency): 请求的平均回应时间。
  CPU 使用率、记忆体使用率： 伺服器的资源使用情况。
  WebSocket 连线数： 系统可以同时处理的 WebSocket 连线数。

- 测试情境：
  模拟大量使用者同时更新分数。
  模拟大量使用者同时查询排行榜。
  模拟大量使用者同时连线到 WebSocket。
