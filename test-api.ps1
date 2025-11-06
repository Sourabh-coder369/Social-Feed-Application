# Test API Endpoints for Social Feed Application

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Social Feed API Testing" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 1. Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get
    Write-Host "   Status: $($health.status)" -ForegroundColor Green
    Write-Host "   Message: $($health.message)" -ForegroundColor Green
} catch {
    Write-Host "   Error: $_" -ForegroundColor Red
}
Write-Host ""

# 2. Get Posts
Write-Host "2. Testing Get Posts..." -ForegroundColor Yellow
try {
    $posts = Invoke-RestMethod -Uri "http://localhost:5000/api/posts?page=1&limit=3" -Method Get
    Write-Host "   Total Posts: $($posts.data.total)" -ForegroundColor Green
    Write-Host "   Showing: $($posts.data.posts.Count) posts" -ForegroundColor Green
    foreach ($post in $posts.data.posts) {
        Write-Host "   - Post #$($post.post_id): '$($post.content.Substring(0, [Math]::Min(40, $post.content.Length)))...' by $($post.author_name)" -ForegroundColor White
    }
} catch {
    Write-Host "   Error: $_" -ForegroundColor Red
}
Write-Host ""

# 3. Register New User
Write-Host "3. Testing User Registration..." -ForegroundColor Yellow
$newUser = @{
    firstName = "Test"
    lastName = "User"
    email = "testuser@example.com"
    password = "Test123456"
    dateOfBirth = "2000-01-01"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method Post -Body $newUser -ContentType "application/json"
    Write-Host "   Registration Successful!" -ForegroundColor Green
    Write-Host "   User ID: $($registerResponse.data.user.user_id)" -ForegroundColor Green
    Write-Host "   Name: $($registerResponse.data.user.first_name) $($registerResponse.data.user.last_name)" -ForegroundColor Green
    Write-Host "   Token: $($registerResponse.data.token.Substring(0, 20))..." -ForegroundColor Green
    $token = $registerResponse.data.token
} catch {
    Write-Host "   Error: $_" -ForegroundColor Red
    # Try login if user already exists
    Write-Host "   Trying to login instead..." -ForegroundColor Yellow
    $loginData = @{
        email = "testuser@example.com"
        password = "Test123456"
    } | ConvertTo-Json
    
    try {
        $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginData -ContentType "application/json"
        Write-Host "   Login Successful!" -ForegroundColor Green
        Write-Host "   User: $($loginResponse.data.user.first_name) $($loginResponse.data.user.last_name)" -ForegroundColor Green
        $token = $loginResponse.data.token
    } catch {
        Write-Host "   Login Error: $_" -ForegroundColor Red
    }
}
Write-Host ""

# 4. Get Current User (Protected Route)
if ($token) {
    Write-Host "4. Testing Get Current User (Protected)..." -ForegroundColor Yellow
    try {
        $headers = @{
            Authorization = "Bearer $token"
        }
        $currentUser = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" -Method Get -Headers $headers
        Write-Host "   Success! Logged in as:" -ForegroundColor Green
        Write-Host "   Name: $($currentUser.data.first_name) $($currentUser.data.last_name)" -ForegroundColor Green
        Write-Host "   Email: $($currentUser.data.email)" -ForegroundColor Green
        Write-Host "   Posts: $($currentUser.data.post_count)" -ForegroundColor Green
    } catch {
        Write-Host "   Error: $_" -ForegroundColor Red
    }
    Write-Host ""
    
    # 5. Create a Post
    Write-Host "5. Testing Create Post (Protected)..." -ForegroundColor Yellow
    $newPost = @{
        content = "This is a test post created via API! 🎉"
        media_URL = "https://picsum.photos/800/600"
        media_type = "image"
    } | ConvertTo-Json
    
    try {
        $postResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/posts" -Method Post -Body $newPost -ContentType "application/json" -Headers $headers
        Write-Host "   Post Created Successfully!" -ForegroundColor Green
        Write-Host "   Post ID: $($postResponse.data.post_id)" -ForegroundColor Green
        Write-Host "   Content: $($postResponse.data.content)" -ForegroundColor Green
    } catch {
        Write-Host "   Error: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend is running at: http://localhost:5173" -ForegroundColor Magenta
Write-Host "Backend is running at: http://localhost:5000" -ForegroundColor Magenta
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
