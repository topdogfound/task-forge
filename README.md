1. Roles and Permission 
```BASH 
composer require spatie/laravel-permission
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
php artisan migrate


php artisan make:seeder RoleSeeder

```