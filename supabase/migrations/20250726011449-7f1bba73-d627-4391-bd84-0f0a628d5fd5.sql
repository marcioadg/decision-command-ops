-- Add back all the RLS policies for the decisions table
CREATE POLICY "Users can view their own decisions" 
ON public.decisions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view decisions in their company" 
ON public.decisions 
FOR SELECT 
USING ((auth.uid() = user_id) OR ((company_id = get_user_company_id()) AND is_company_admin()) OR (get_current_user_role() = 'admin'::text));

CREATE POLICY "Users can create their own decisions" 
ON public.decisions 
FOR INSERT 
WITH CHECK ((auth.uid() = user_id) AND ((company_id IS NULL) OR (company_id = get_user_company_id())));

CREATE POLICY "Users can create decisions in their company" 
ON public.decisions 
FOR INSERT 
WITH CHECK ((auth.uid() = user_id) AND ((company_id = get_user_company_id()) OR (company_id IS NULL)));

CREATE POLICY "Users can update their own decisions" 
ON public.decisions 
FOR UPDATE 
USING ((auth.uid() = user_id) OR ((company_id IS NOT NULL) AND (company_id = get_user_company_id())));

CREATE POLICY "Users can update their own decisions or company admins can upda" 
ON public.decisions 
FOR UPDATE 
USING ((auth.uid() = user_id) OR ((company_id = get_user_company_id()) AND is_company_admin()) OR (get_current_user_role() = 'admin'::text));

CREATE POLICY "Users can delete their own decisions" 
ON public.decisions 
FOR DELETE 
USING ((auth.uid() = user_id) OR ((company_id IS NOT NULL) AND (company_id = get_user_company_id())));

CREATE POLICY "Users can delete their own decisions or company admins can dele" 
ON public.decisions 
FOR DELETE 
USING ((auth.uid() = user_id) OR ((company_id = get_user_company_id()) AND is_company_admin()) OR (get_current_user_role() = 'admin'::text));

-- Recreate the triggers
CREATE TRIGGER validate_decision_input_trigger
    BEFORE INSERT OR UPDATE ON public.decisions
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_decision_input();

CREATE TRIGGER handle_updated_at_trigger
    BEFORE UPDATE ON public.decisions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();