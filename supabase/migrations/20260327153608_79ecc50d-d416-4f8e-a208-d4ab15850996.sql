-- Allow veterinarios to read and update their own assinante record
CREATE POLICY "Assinantes can read own record"
ON public.assinantes
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Assinantes can update own record"
ON public.assinantes
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());