/* DASH Mobile Services — Owner Management Backend
 * This module defines the owner-only management systems without changing manager/employee UI.
 * It is intentionally additive: existing portals remain untouched until each system is wired individually.
 */
window.DASH_OWNER_BACKEND_SYSTEMS = {
  inventory: {name:'Inventory Management', status:'ready-for-integration', metrics:['current_stock','minimum_stock','target_stock','maximum_stock','average_daily_usage','days_until_stockout','last_order','last_delivery','damage','adjustments','order_timing']},
  jobProfitability: {name:'Job Profitability', status:'ready-for-integration', metrics:['estimated_revenue','estimated_cost','actual_revenue','actual_cost','actual_profit','margin','callback_cost']},
  employeeProductivity: {name:'Employee Productivity', status:'ready-for-integration', metrics:['hours_worked','revenue_producing_hours','operations_hours','training_hours','productivity_trend']},
  customerProfitability: {name:'Customer Profitability', status:'ready-for-integration', metrics:['jobs','revenue','job_cost','contribution','retention']},
  routeEfficiency: {name:'Route Efficiency', status:'ready-for-integration', metrics:['jobs_grouped','drive_time','mileage','fuel_estimate','route_efficiency']},
  fleetEquipment: {name:'Vehicle & Equipment Tracking', status:'ready-for-integration', metrics:['mileage','maintenance','registration','insurance','assignment','service_due']},
  equipmentUtilization: {name:'Equipment Utilization', status:'ready-for-integration', metrics:['hours_used','jobs_supported','idle_time','utilization_rate']},
  customerQuality: {name:'Customer Quality', status:'ready-for-integration', metrics:['complaints','ratings','callbacks','trend']},
  callbacks: {name:'Callback Tracking', status:'ready-for-integration', metrics:['original_revenue','extra_labor','extra_fuel','extra_material','actual_profit_after_callback']},
  training: {name:'Employee Training Triggers', status:'ready-for-integration', metrics:['quality_triggers','attendance_triggers','required_training','completion']},
  retention: {name:'Customer Retention', status:'ready-for-integration', metrics:['service_interval','days_since_service','overdue_flag','follow_up']},
  revenueForecast: {name:'Revenue Forecasting', status:'ready-for-integration', metrics:['confirmed_revenue','scheduled_revenue','recurring_revenue','projected_cost','projected_profit']},
  ownerDraw: {name:'Owner Draw Protection', status:'ready-for-integration', metrics:['cash_available','payroll_reserve','tax_reserve','inventory_reserve','emergency_reserve','available_owner_distribution']},
  managerPerformance: {name:'Manager Performance', status:'ready-for-integration', metrics:['inventory_timing','schedule_issues','customer_complaints','employee_complaints','unresolved_issues','interventions']},
  ownerAttention: {name:'Owner Attention Required', status:'ready-for-integration', metrics:['urgent','routine','unresolved','source_system']},
  employeePerformance: {name:'Employee Performance Review', status:'ready-for-integration', policy:{threshold:60, labels:{excellent:'81-100%',monitor:'61-80%',ownerReview:'0-60%'}}, metrics:['overall_rating','category_scores','obvious_issues','trend','company_impact','owner_recommendation']},
  roleHistory: {name:'Role-Based Performance History', status:'ready-for-integration', metrics:['regular_employee_period','manager_period','current_role_period','promotion_change']},
  complaints: {name:'Complaints & Incidents', status:'ready-for-integration', sources:['customer','employee','owner_operational'], determinations:['confirmed','not_confirmed','unfounded','still_reviewing'], metrics:['date','source','category','severity','description','related_job','action','resolution','owner_notes']},
  employeeReports: {name:'Employee Report a Concern', status:'ready-for-integration', sources:['manager','employee','company'], categories:['scheduling','workplace_behavior','safety','harassment_bullying','customer_issue','pay_timekeeping','policy','other'], priority:['normal','immediate_owner_attention']}
};

window.DASH_OWNER_PERFORMANCE = {
  calculateOverall(scores){
    const values=Object.values(scores||{}).filter(v=>Number.isFinite(Number(v))).map(Number);
    return values.length ? Math.round(values.reduce((a,b)=>a+b,0)/values.length) : 0;
  },
  status(score){
    score=Number(score)||0;
    if(score>=81)return 'Performing Well';
    if(score>=61)return 'Performance Concern';
    return 'Fireable — Owner Review';
  }
};
