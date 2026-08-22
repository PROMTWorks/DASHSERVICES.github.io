/* Owner-only data contract. UI integration will be completed system-by-system. */
window.DASH_OWNER_REPORTS = {
  complaintSources: ['Customer','Employee','Owner/Operations'],
  determinations: ['Confirmed','Not Confirmed','Unfounded','Still Reviewing'],
  managerComplaintSources: ['Customer','Employee','Owner/Operations'],
  concernCategories: ['Scheduling','Workplace Behavior','Safety','Harassment/Bullying','Customer Issue','Pay/Timekeeping','Policy Issue','Other'],
  createComplaint(input){
    return {
      ...input,
      determination: input.determination || 'Still Reviewing',
      createdAt: input.createdAt || new Date().toISOString(),
      ownerOnly: true
    };
  },
  createEmployeeReport(input){
    return {
      ...input,
      priority: input.priority || 'normal',
      status: 'Owner Review',
      ownerOnly: true,
      createdAt: input.createdAt || new Date().toISOString()
    };
  }
};
