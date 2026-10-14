-- =====================================================================
-- Viora Living Saigon – Bổ sung bảo mật cho CSDL Tuyển dụng
-- Chạy SAU file 20261013000000_viora_tuyen_dung.sql (SQL Editor → New query → Run).
-- An toàn khi chạy lại.
-- =====================================================================

-- ---------- 1. is_hr(): chỉ tin tài khoản đã XÁC NHẬN email ----------
-- Bản cũ chỉ so email trong JWT. Nếu project tắt "Confirm email", người lạ có thể
-- đăng ký bằng email HR mà không cần sở hữu hộp thư → xem được toàn bộ hồ sơ.
create or replace function public.is_hr()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.hr_users h
    join auth.users u on lower(u.email) = lower(h.email)
    where u.id = auth.uid()
      and u.email_confirmed_at is not null
  );
$$;

-- ---------- 2. check_rate_limit(): chặn tham số sai (chia cho 0) ----------
create or replace function public.check_rate_limit(p_key text, p_limit int, p_window_seconds int)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_window timestamptz; v_count int;
begin
  if p_window_seconds is null or p_window_seconds <= 0 or p_limit is null or p_limit < 0 then
    raise exception 'check_rate_limit: tham số không hợp lệ';
  end if;
  v_window := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  insert into public.rate_limits (key, window_start, count) values (p_key, v_window, 1)
  on conflict (key, window_start) do update set count = public.rate_limits.count + 1
  returning count into v_count;
  return v_count <= p_limit;
end $$;
revoke execute on function public.check_rate_limit(text,int,int) from anon, authenticated, public;
grant  execute on function public.check_rate_limit(text,int,int) to service_role;

-- ---------- 3. HR chỉ được đổi các cột nghiệp vụ, không sửa dữ liệu ứng viên ----------
revoke update on public.applications from authenticated;
grant  update (status, hr_note, hr_owner) on public.applications to authenticated;
